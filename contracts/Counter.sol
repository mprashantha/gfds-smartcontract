//SPDX-License-Identifier:UNLICENSED
pragma solidity 0.8.7;

contract Counter {
    uint256 counter;
    address owner;

    constructor() {
        counter = 0;
        owner = msg.sender;
    }

    event counterReset(uint256 oldCounter);

    modifier onlyOwner() {
        require(msg.sender == owner, "only Owner");
        _;
    }

    function add() public {
        counter++;
    }

    function subtract() public {
        counter--;
    }

    function reset() public onlyOwner {
        emit counterReset(counter);
        counter = 0;
    }

    function getCurrentCount() public view returns (uint256) {
        return counter;
    }
}
