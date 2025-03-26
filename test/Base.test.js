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
        })

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
    });
});