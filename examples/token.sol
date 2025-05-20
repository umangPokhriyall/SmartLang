// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {

    // State variables
    address owner;
    mapping(address => uint256) balances;
    uint256 totalSupply = 1000000;
    bool _reentrancyLock_transfer = false;

    // Events
    event Transfer(address from, address to, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    modifier nonReentrant_transfer() {
        require(_reentrancyLock_transfer == false, "ReentrancyGuard: reentrant call");
        _reentrancyLock_transfer = true;
        _;
        _reentrancyLock_transfer = false;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Functions
    function mint(address to, uint256 amount) public onlyOwner {
        balances[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) public nonReentrant_transfer returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

}