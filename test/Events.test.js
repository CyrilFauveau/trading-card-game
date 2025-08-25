const { expect } = require("chai");
const { setupTCGFixture, loadFixture, time } = require("./Setup.test");

describe("Events", function () {
    let owner, user, tradingCardGame, boosterDelay;

    beforeEach(async function () {
        ({ owner, user, tradingCardGame, boosterDelay } = await loadFixture(setupTCGFixture));
    });

    describe("BoosterOpened Event", function () {
        it("Should emit BoosterOpened event when opening a booster", async function () {
            await expect(tradingCardGame.connect(user).openBooster())
                .to.emit(tradingCardGame, "BoosterOpened");
        });

        it("Should emit BoosterOpened event with correct user address", async function () {
            const tx = await tradingCardGame.connect(user).openBooster();
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(log => 
                log.fragment && log.fragment.name === "BoosterOpened"
            );
            
            expect(event).to.not.be.undefined;
            expect(event.args[0]).to.equal(user.address);
        });

        it("Should emit BoosterOpened event with correct number of cards", async function () {
            const tx = await tradingCardGame.connect(user).openBooster();
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(log => 
                log.fragment && log.fragment.name === "BoosterOpened"
            );
            
            expect(event).to.not.be.undefined;
            expect(event.args[1].length).to.equal(5); // BOOSTER_CARDS_NUMBER
        });

        it("Should emit BoosterOpened event with valid card IDs", async function () {
            const tx = await tradingCardGame.connect(user).openBooster();
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(log => 
                log.fragment && log.fragment.name === "BoosterOpened"
            );
            
            expect(event).to.not.be.undefined;
            const cardIds = event.args[1];
            
            for (let i = 0; i < cardIds.length; i++) {
                expect(cardIds[i]).to.be.gte(1);
                expect(cardIds[i]).to.be.lte(207); // COLLECTION_CARDS_NUMBER
            }
        });

        it("Should not emit BoosterOpened event when function reverts", async function () {
            await tradingCardGame.connect(user).openBooster();
            
            await expect(tradingCardGame.connect(user).openBooster()).to.be.revertedWith("Wait before opening another booster");
        });

        it("Should emit BoosterOpened event with correct indexed user parameter", async function () {
            const tx = await tradingCardGame.connect(user).openBooster();
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(log => 
                log.fragment && log.fragment.name === "BoosterOpened"
            );
            
            expect(event).to.not.be.undefined;
            expect(event.args[0]).to.equal(user.address);
        });
    });

    describe("Event Gas Efficiency", function () {
        it("Should emit events efficiently", async function () {
            const tx = await tradingCardGame.connect(user).openBooster();
            const receipt = await tx.wait();
            
            expect(receipt.gasUsed).to.be.lt(500000);
        });
    });

    describe("Event Data Integrity", function () {
        it("Should maintain event data consistency with contract state", async function () {
            const tx = await tradingCardGame.connect(user).openBooster();
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(log => 
                log.fragment && log.fragment.name === "BoosterOpened"
            );
            
            const cardIds = event.args[1];
            
            const [actualCards, actualQuantities] = await tradingCardGame.getCardsByUser(user.address);
            
            expect(actualCards.length).to.equal(cardIds.length);
            expect(actualCards.length).to.equal(5);
            
            for (let i = 0; i < cardIds.length; i++) {
                expect(actualCards).to.include(cardIds[i]);
            }
        });
    });
});
