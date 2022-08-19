const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Counter Unit Tests", function () {
          let counterContract // , deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              await deployments.fixture(["Counter"]) // Deploys modules with the tags "Counter"
              counterContract = await ethers.getContract("Counter") // Returns a new connection to the counter contract
          })

          //let counterContract, deployer
          //beforeEach(async function () {
          //   deployer = (await getNamedAccounts()).deployer
          //   counterContract = await ethers.getContract("Counter", deployer)
          //})

          describe("constructor", function () {
              it("intitiallizes the couner correctly", async () => {
                  const currentCounter = await counterContract.getCurrentCount()
                  assert.equal(currentCounter, 0)
              })
          })

          describe("Operations", function () {
              it("add", async () => {
                  await counterContract.add()
                  await counterContract.add()
                  const currentCounter = await counterContract.getCurrentCount()
                  assert.equal(2, currentCounter)
              })
              it("subtract", async () => {
                  await counterContract.add()
                  await counterContract.subtract()
                  const currentCounter = await counterContract.getCurrentCount()
                  assert.equal(0, currentCounter)
              })
              it("reset - only owner", async () => {
                  counterContractNonOwner = counterContract.connect(accounts[1]) //get to another account
                  await expect(counterContractNonOwner.reset()).to.be.revertedWith("only Owner")
              })
              it("reset with owner, should work fine", async () => {
                  await counterContract.add()
                  await counterContract.add()
                  await counterContract.add()
                  const currentCounter = await counterContract.getCurrentCount()

                  const txResponse = await counterContract.reset() // emits event
                  const txReceipt = await txResponse.wait(1) // waits 1 block
                  const eventCounter = txReceipt.events[0].args.oldCounter
                  assert(eventCounter, currentCounter)
              })
          })
      })
