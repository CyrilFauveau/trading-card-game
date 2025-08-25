const { expect } = require("chai");
const { setupTCGFixture, loadFixture, time } = require("./Setup.test");

describe("Booster opening", function () {
    let owner, user, tradingCardGame, boosterDelay;

    beforeEach(async function () {
        ({ owner, user, tradingCardGame, boosterDelay } = await loadFixture(setupTCGFixture));
    });

    describe("setBoosterDelay()", function () {
        it("Should revert if not the owner", async function () {
            await expect(tradingCardGame.connect(user).setBoosterDelay(50000)).to.be.revertedWithCustomError(tradingCardGame, "OwnableUnauthorizedAccount");
        });

        it("Should change the value of BOOSTER_OPENING_DELAY", async function () {
            await tradingCardGame.connect(owner).setBoosterDelay(50000);
            
            const boosterOpeningDelay = await tradingCardGame.BOOSTER_OPENING_DELAY();

            expect(boosterOpeningDelay).to.equal(50000);
        });
    });

    describe("setCollectionCardsNumber()", function () {
        it("Should revert if not the owner", async function () {
            await expect(tradingCardGame.connect(user).setCollectionCardsNumber(100)).to.be.revertedWithCustomError(tradingCardGame, "OwnableUnauthorizedAccount");
        });

        it("Should change the value of COLLECTION_CARDS_NUMBER", async function () {
            await tradingCardGame.connect(owner).setCollectionCardsNumber(100);
            
            const collectionCardsNumber = await tradingCardGame.COLLECTION_CARDS_NUMBER();

            expect(collectionCardsNumber).to.equal(100);
        });
    });

    describe("setBoosterCardsNumber()", function () {
        it("Should revert if not the owner", async function () {
            await expect(tradingCardGame.connect(user).setBoosterCardsNumber(10)).to.be.revertedWithCustomError(tradingCardGame, "OwnableUnauthorizedAccount");
        });

        it("Should change the value of BOOSTER_CARDS_NUMBER", async function () {
            await tradingCardGame.connect(owner).setBoosterCardsNumber(10);
            
            const boosterCardsNumber = await tradingCardGame.BOOSTER_CARDS_NUMBER();

            expect(boosterCardsNumber).to.equal(10);
        });
    });

    describe("setMinimumEthBalance()", function () {
        it("Should revert if not the owner", async function () {
            await expect(tradingCardGame.connect(user).setMinimumEthBalance(ethers.parseEther("0.002"))).to.be.revertedWithCustomError(tradingCardGame, "OwnableUnauthorizedAccount");
        });

        it("Should change the value of minimumEthBalance", async function () {
            await tradingCardGame.connect(owner).setMinimumEthBalance(ethers.parseEther("0.005"));
            
            const minimumEthBalance = await tradingCardGame.minimumEthBalance();

            expect(minimumEthBalance).to.equal(ethers.parseEther("0.005"));
        });
    });

    describe("mint()", function () {
        it("Should revert if not the owner", async function () {
            await expect(tradingCardGame.connect(user).mint(user.address, 1, 1)).to.be.revertedWithCustomError(tradingCardGame, "OwnableUnauthorizedAccount");
        });

        it("Should mint a card", async function () {
            await tradingCardGame.connect(owner).mint(owner.address, 1, 1);
            const [cards, quantities] = await tradingCardGame.getCardsByUser(owner.address);
            expect(cards.length).to.equal(1);
            expect(quantities[0]).to.equal(1);
        });
    });

    describe("openBooster()", function () {
        it("Should open a booster of random cards", async function () {
            await tradingCardGame.connect(user).openBooster();
            
            const [cards, quantities] = await tradingCardGame.getCardsByUser(user.address);

            const totalCardsReceived = quantities.reduce((sum, qty) => sum + qty);

            expect(totalCardsReceived).to.equal(5);
        });

        it("Should open 100 boosters of random cards", async function () {
            for (let i = 0; i < 100; i++) {
                await tradingCardGame.connect(user).openBooster();
                await time.increase(boosterDelay);
            }

            const [cards, quantities] = await tradingCardGame.getCardsByUser(user.address);

            const totalCardsReceived = quantities.reduce((sum, qty) => sum + qty);

            expect(totalCardsReceived).to.equal(500);
        });

        it("Should revert if already opened before delay", async function () {
            await tradingCardGame.connect(user).openBooster();

            await expect(tradingCardGame.connect(user).openBooster()).to.be.revertedWith("Wait before opening another booster");
        });

        describe("Minimum ETH balance requirement", function () {
            it("Should revert if user has insufficient ETH balance", async function () {
                await tradingCardGame.connect(owner).setMinimumEthBalance(ethers.parseEther("1000000"));
                
                await expect(tradingCardGame.connect(user).openBooster()).to.be.revertedWith("Insufficient ETH balance");
            });

            it("Should allow opening booster if user has sufficient ETH balance", async function () {
                const userBalance = await ethers.provider.getBalance(user.address);
                expect(userBalance).to.be.gte(ethers.parseEther("0.001"));
                
                await tradingCardGame.connect(user).openBooster();
                
                const [cards, quantities] = await tradingCardGame.getCardsByUser(user.address);
                expect(cards.length).to.equal(5);
            });

            it("Should work with custom minimum ETH balance", async function () {
                await tradingCardGame.connect(owner).setMinimumEthBalance(ethers.parseEther("0.01"));
                
                const userBalance = await ethers.provider.getBalance(user.address);
                expect(userBalance).to.be.gte(ethers.parseEther("0.01"));
                
                await tradingCardGame.connect(user).openBooster();
                
                const [cards, quantities] = await tradingCardGame.getCardsByUser(user.address);
                expect(cards.length).to.equal(5);
            });

            it("Should work with 0 minimum ETH balance", async function () {
                await tradingCardGame.connect(owner).setMinimumEthBalance(0);
                
                await tradingCardGame.connect(user).openBooster();
                
                const [cards, quantities] = await tradingCardGame.getCardsByUser(user.address);
                expect(cards.length).to.equal(5);
            });

            it("Should prevent address farming by requiring minimum balance", async function () {
                await tradingCardGame.connect(owner).setMinimumEthBalance(ethers.parseEther("1000000"));
                
                const [_, __, user1, user2, user3] = await ethers.getSigners();
                
                await expect(tradingCardGame.connect(user1).openBooster()).to.be.revertedWith("Insufficient ETH balance");
                await expect(tradingCardGame.connect(user2).openBooster()).to.be.revertedWith("Insufficient ETH balance");
                await expect(tradingCardGame.connect(user3).openBooster()).to.be.revertedWith("Insufficient ETH balance");
                
                await tradingCardGame.connect(owner).setMinimumEthBalance(ethers.parseEther("0.001"));
            });
        });
    });

    describe("Initial state", function () {
        it("Should have correct default minimum ETH balance", async function () {
            const minimumEthBalance = await tradingCardGame.minimumEthBalance();
            expect(minimumEthBalance).to.equal(ethers.parseEther("0.001"));
        });

        it("Should have correct default booster opening delay", async function () {
            const boosterOpeningDelay = await tradingCardGame.BOOSTER_OPENING_DELAY();
            expect(boosterOpeningDelay).to.equal(12 * 60 * 60); // 12 hours
        });

        it("Should have correct default collection cards number", async function () {
            const collectionCardsNumber = await tradingCardGame.COLLECTION_CARDS_NUMBER();
            expect(collectionCardsNumber).to.equal(207);
        });

        it("Should have correct default booster cards number", async function () {
            const boosterCardsNumber = await tradingCardGame.BOOSTER_CARDS_NUMBER();
            expect(boosterCardsNumber).to.equal(5);
        });
    });
});