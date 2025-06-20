// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {

    // State variables
    address owner;
    uint256 itemCount = 0;
    mapping(uint256 items = > uint256);
    mapping(uint256 itemOwners = > address);
    mapping(uint256 itemPrices = > uint256);
    mapping(address balances = > uint256);
    bool _reentrancyLock_buyItem = false;

    // Events
    event ItemAdded(uint256 itemId, uint256 price);
    event ItemSold(uint256 itemId, address buyer, uint256 price);
    event Deposit(address user, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    modifier nonReentrant_buyItem() {
        require(_reentrancyLock_buyItem == false, "ReentrancyGuard: reentrant call");
        _reentrancyLock_buyItem = true;
        _;
        _reentrancyLock_buyItem = false;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Functions
    function addItem(uint256 price) public onlyOwner {
        itemCount += 1;
        items[itemCount] = itemCount;
        itemOwners[itemCount] = msg.sender;
        itemPrices[itemCount] = price;
        emit ItemAdded(itemCount, price);
    }

    function buyItem(uint256 itemId) public nonReentrant_buyItem {
        require(items[itemId] > 0, "Item does not exist");
        require(balances[msg.sender] >= itemPrices[itemId], "Insufficient balance");
        balances[msg.sender] -= itemPrices[itemId];
        balances[itemOwners[itemId] += itemPrices[itemId];
        itemOwners[itemId] = msg.sender;
        emit ItemSold(itemId, msg.sender, itemPrices[itemId]);
    }

    function deposit() public {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function getBalance() public returns (uint256) {
        return balances[msg.sender];
    }

}