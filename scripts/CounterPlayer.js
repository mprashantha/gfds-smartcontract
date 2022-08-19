const { ethers } = require("hardhat")

async function TryCounterOps() {
    const counter = await ethers.getContract("Counter")
    await counter.add()
    await counter.add()
    await counter.subtract()
    const currentCount = await counter.getCurrentCount()
    console.log(`Current Count: ${currentCount}`)
    console.log("TryCounterOps Worked")
}

TryCounterOps()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
