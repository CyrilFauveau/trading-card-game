const { expect } = require("chai");
const { setupTCGFixture, loadFixture, time } = require("./Setup.test");

describe("Booster opening", function () {
    let owner, user, tradingCardGame, boosterDelay;

    beforeEach(async function () {
        ({ owner, user, tradingCardGame, boosterDelay } = await loadFixture(setupTCGFixture));
    });

    describe("mint()", function () {
        it("Should revert if not the owner", async function () {
            await expect(tradingCardGame.connect(user).mint(user.address, 1, 1)).to.be.revertedWithCustomError(tradingCardGame, "OwnableUnauthorizedAccount");
        });

        it("Should mint a card", async function () {
            await tradingCardGame.connect(owner).mint(owner.address, 1, 1);
            const [ids, amounts] = await tradingCardGame.getCardsByUser(owner.address);
            expect(ids.length).to.equal(1);
            expect(amounts[0]).to.equal(1);
        });
    });
});