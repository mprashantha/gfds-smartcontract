const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) //TODO: Once we are moving to testnet, ! should be removed
    ? describe.skip
    : describe("Counter Staging Tests", function () {
          let counterContract, currentCounter //, deployer

          //TODO: Enable this for testnet
          //   beforeEach(async function () {
          //       deployer = (await getNamedAccounts()).deployer
          //       counterContract = await ethers.getContract("Couter", deployer)
          //   })
          //TODO: Comment this for testnet
          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              await deployments.fixture(["Counter"]) // Deploys modules with the tags "Counter"
              counterContract = await ethers.getContract("Counter") // Returns a new connection to the counter contract
          })

          describe("Counter end-to-end test", function () {
              it("complete test of counter", async function () {
                  try {
                      //add
                      await counterContract.add()
                      currentCounter = await counterContract.getCurrentCount()
                      assert.equal(1, currentCounter)

                      //subtract
                      await counterContract.subtract()
                      currentCounter = await counterContract.getCurrentCount()
                      assert.equal(0, currentCounter)

                      await counterContract.add()
                      await counterContract.add()
                      currentCounter = await counterContract.getCurrentCount()

                      //reset
                      const txResponse = await counterContract.reset() // emits event
                      const txReceipt = await txResponse.wait(1) // waits 1 block
                      const eventCounter = txReceipt.events[0].args.oldCounter
                      assert(eventCounter, currentCounter)
                  } catch (error) {
                      console.log(error)
                  }
              })
          })
      })
