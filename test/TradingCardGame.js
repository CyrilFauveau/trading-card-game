const { ethers } = require("hardhat");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

async function setupTCGFixture() {
    const [owner, user] = await ethers.getSigners();
    const tradingCardGame = await ethers.deployContract("TradingCardGame");
    const boosterDelay = 12 * 60 * 60; // 12 hours

    return { owner, user, tradingCardGame, boosterDelay };
}

module.exports = {
    PANIC_CODES,
    loadFixture,
    time,
    setupTCGFixture,
};