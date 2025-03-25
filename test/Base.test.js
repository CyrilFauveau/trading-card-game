const { expect } = require("chai");
const { setupTCGFixture, loadFixture, time } = require("./TradingCardGame");

describe("Booster opening", function () {
    let owner, user, tradingCardGame, boosterDelay;

    beforeEach(async function () {
        ({ owner, user, tradingCardGame, boosterDelay } = await loadFixture(setupTCGFixture));
    });
});