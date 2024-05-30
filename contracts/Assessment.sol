// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount, address from);
    event Withdraw(uint256 amount, address to);
    event Transfer(address to, uint256 amount);
    event Redeem(address indexed to, uint256 amount);
    event ExclusiveRedeemed(address indexed to, uint256 indexed gameId, uint256 amount); // Event for redeeming a specific game item

    mapping(uint256 => uint256) public gamePrices;

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;

        // Initialize game prices
        gamePrices[1] = 1;
        gamePrices[2] = 2;
        gamePrices[3] = 3;
        gamePrices[4] = 4;
        gamePrices[5] = 5;
        gamePrices[6] = 6;
        gamePrices[7] = 7;
        gamePrices[8] = 8;
        gamePrices[9] = 9;
        gamePrices[10] = 10;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        require(msg.sender == owner, "You are not the owner of this account");
        require(_amount > 0 && _amount <= 10, "Deposit amount must be between 1 and 10 tokens");

        balance += _amount;

        assert(balance == _previousBalance + _amount);

        emit Deposit(_amount, msg.sender);
    }

    function withdraw(uint256 _amount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_amount > 0 && _amount <= balance, "Invalid withdrawal amount");

        balance -= _amount;
        owner.transfer(_amount);

        emit Withdraw(_amount, msg.sender);
    }

function transfer(address payable _to, uint256 _amount) public {
    require(msg.sender == owner, "You are not the owner of this account");
    require(_amount > 0 && _amount <= 10, "Transfer amount must be between 1 and 10 tokens");
    require(balance >= _amount, "Insufficient balance");

    // Transfer tokens
    balance -= _amount;
    _to.transfer(_amount);

    // Calculate and transfer equivalent Ethereum amount, limited to 10 times the token amount
    uint256 ethAmount = _amount * 1 ether;
    if (ethAmount > 10 ether) {
        ethAmount = 10 ether;
    }
    _to.transfer(ethAmount);

    emit Transfer(_to, _amount);
    }

    function redeem(uint256 _gameId) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_gameId >= 1 && _gameId <= 10, "Invalid game ID");

        uint256 gamePrice = gamePrices[_gameId];
        require(balance >= gamePrice, "Insufficient balance to redeem this game");

        // Transfer game item to owner
        balance -= gamePrice;

        // Emit event indicating the redemption of a game item
        emit Redeem(msg.sender, gamePrice);

        // Emit event indicating the redemption of a specific game item
        emit ExclusiveRedeemed(msg.sender, _gameId, gamePrice);
    }
}