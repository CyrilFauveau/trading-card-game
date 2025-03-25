// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A Trading card game
/// @author Cyril Fauveau
/// @notice This is a personal project
/// @custom:experimental This is an experimental contract
contract TradingCardGame is ERC1155, Ownable {

    uint32 public BOOSTER_OPENING_DELAY = 12 hours;
    uint16 public COLLECTION_CARDS_NUMBER = 207;
    uint16 public BOOSTER_CARDS_NUMBER = 5;

    mapping(address => mapping(uint256 => uint256)) public userCardBalances;
    mapping(address => uint256) public lastBoosterTimestamp;

    event BoosterOpened(address indexed user, uint256[] cardIds);

    constructor() Ownable(msg.sender) ERC1155("https://gateway.pinata.cloud/ipfs/bafybeibn6dopwmu5ususvo5edre4c7vrbm2z5ihttd2swvdj6snhdt4tum/{id}.json") {}

    /// ==================== CONFIG ==================== ///
    function setBoosterDelay(uint32 _delay) public onlyOwner {
        BOOSTER_OPENING_DELAY = _delay;
    }

    /// @dev should be an automic number at the end
    function setCollectionCardsNumber(uint16 _number) public onlyOwner {
        COLLECTION_CARDS_NUMBER = _number;
    }

    /// @dev should be an automic number at the end
    function setBoosterCardsNumber(uint16 _number) public onlyOwner {
        BOOSTER_CARDS_NUMBER = _number;
    }

    /// ==================== GETTERS ==================== ///
    function getCardsByUser(address user) public view returns (uint256[] memory, uint256[] memory) {
        uint256[] memory ids = new uint256[](COLLECTION_CARDS_NUMBER);
        uint256[] memory amounts = new uint256[](COLLECTION_CARDS_NUMBER);
        uint256 count = 0;

        for (uint16 i = 1; i <= COLLECTION_CARDS_NUMBER; i++) {
            if (userCardBalances[user][i] > 0) {
                ids[count] = i;
                amounts[count] = userCardBalances[user][i];
                count++;
            }
        }

        // Reduce size of array to avoid useless 0
        assembly {
            mstore(ids, count)
            mstore(amounts, count)
        }

        return (ids, amounts);
    }

    /// @notice Mint a single card
    function mint(address to, uint256 id, uint256 amount) public onlyOwner {
        _mint(to, id, amount, "");
        userCardBalances[to][id] += amount;
    }

    /// @notice Mint a batch of cards
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) public onlyOwner {
        _mintBatch(to, ids, amounts, "");
        for (uint256 i = 0; i < ids.length; i++) {
            userCardBalances[to][ids[i]] += amounts[i];
        }
    }

    /// @notice Open a booster and get random cards
    function openBooster() public {
        require(block.timestamp >= lastBoosterTimestamp[msg.sender] + BOOSTER_OPENING_DELAY, "Wait before opening another booster");

        uint256[] memory ids = new uint256[](BOOSTER_CARDS_NUMBER);
        uint256[] memory amounts = new uint256[](BOOSTER_CARDS_NUMBER);

        for (uint8 i = 0; i < BOOSTER_CARDS_NUMBER; i++) {
            uint256 randomId = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % COLLECTION_CARDS_NUMBER) + 1;
            ids[i] = randomId;
            amounts[i] = 1;
        }

        mintBatch(msg.sender, ids, amounts);
        lastBoosterTimestamp[msg.sender] = block.timestamp;

        emit BoosterOpened(msg.sender, ids);
    }
}
