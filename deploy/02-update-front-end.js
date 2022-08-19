const { frontEndContractsFile, frontEndAbiFile } = require("../helper-hardhat-config")
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const counterContract = await ethers.getContract("Counter")
    fs.writeFileSync(
        frontEndAbiFile,
        counterContract.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddresses() {
    const counterContract = await ethers.getContract("Counter")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (network.config.chainId.toString() in contractAddresses) {
        if (
            !contractAddresses[network.config.chainId.toString()].includes(counterContract.address)
        ) {
            contractAddresses[network.config.chainId.toString()].push(counterContract.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [counterContract.address]
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
