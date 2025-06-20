contract Marketplace:
    @safe_math
    state:
        owner: address = msg.sender
        itemCount: uint256 = 0
        items: mapping(uint256 => uint256)
        itemOwners: mapping(uint256 => address)
        itemPrices: mapping(uint256 => uint256)
        balances: mapping(address => uint256)
    
    @only_owner
    function addItem(price: uint256):
        itemCount += 1
        items[itemCount] = itemCount
        itemOwners[itemCount] = msg.sender
        itemPrices[itemCount] = price
        emit ItemAdded(itemCount, price)
    
    @reentrancy_guard
    function buyItem(itemId: uint256):
        require(items[itemId] > 0, "Item does not exist")
        require(balances[msg.sender] >= itemPrices[itemId], "Insufficient balance")
        balances[msg.sender] -= itemPrices[itemId]
        balances[itemOwners[itemId]] += itemPrices[itemId]
        itemOwners[itemId] = msg.sender
        emit ItemSold(itemId, msg.sender, itemPrices[itemId])
    
    function deposit():
        balances[msg.sender] += msg.value
        emit Deposit(msg.sender, msg.value)
    
    function getBalance() -> uint256:
        return balances[msg.sender]

    event ItemAdded(itemId: uint256, price: uint256)
    event ItemSold(itemId: uint256, buyer: address, price: uint256)
    event Deposit(user: address, amount: uint256) 