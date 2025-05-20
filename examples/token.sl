contract SimpleToken:
    @safe_math
    state:
        owner: address = msg.sender
        balances: mapping(address => uint256)
        totalSupply: uint256 = 1000000
    
    @only_owner
    function mint(to: address, amount: uint256):
        balances[to] += amount
        totalSupply += amount
        emit Transfer(address(0), to, amount)
    
    @reentrancy_guard
    function transfer(to: address, amount: uint256) -> bool:
        require(balances[msg.sender] >= amount, "Insufficient balance")
        balances[msg.sender] -= amount
        balances[to] += amount
        emit Transfer(msg.sender, to, amount)
        return true

    event Transfer(from: address, to: address, amount: uint256) 