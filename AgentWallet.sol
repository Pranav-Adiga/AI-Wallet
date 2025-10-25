// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AgentWallet {
    using ECDSA for bytes32;

    address public owner;
    uint256 public nonce;
    uint256 public dailySpent;
    uint256 public dailyWindowStart;
    uint256 public dailyLimit;
    mapping(address => bool) public whitelist;
    address public governor;

    event Executed(address indexed to, uint256 value, bytes data, address indexed by);
    event Deposit(address indexed from, uint256 value);
    event Withdraw(address indexed to, uint256 value);
    event WhitelistUpdated(address indexed who, bool allowed);
    event DailyLimitUpdated(uint256 newLimit);
    event OwnerUpdated(address newOwner);

    constructor(address _owner, uint256 _dailyLimit) {
        owner = _owner;
        dailyLimit = _dailyLimit;
        governor = msg.sender;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function setOwner(address _owner) external {
        require(msg.sender == governor, "only governor");
        owner = _owner;
        emit OwnerUpdated(_owner);
    }

    function setGovernor(address _gov) external {
        require(msg.sender == governor, "only governor");
        governor = _gov;
    }

    function setDailyLimit(uint256 _limit) external {
        require(msg.sender == governor, "only governor");
        dailyLimit = _limit;
        emit DailyLimitUpdated(_limit);
    }

    function updateWhitelist(address _who, bool _allowed) external {
        require(msg.sender == governor, "only governor");
        whitelist[_who] = _allowed;
        emit WhitelistUpdated(_who, _allowed);
    }

    function execute(
        address to,
        uint256 value,
        bytes calldata data,
        uint256 deadline,
        bytes calldata signature
    ) external returns (bytes memory) {
        require(block.timestamp <= deadline, "expired");
        require(whitelist[to], "recipient not whitelisted");

        if (block.timestamp > dailyWindowStart + 1 days) {
            dailyWindowStart = block.timestamp;
            dailySpent = 0;
        }
        require(dailySpent + value <= dailyLimit, "daily limit reached");

        bytes32 hash = keccak256(abi.encodePacked(address(this), nonce, to, value, data, deadline));
        bytes32 ethHash = hash.toEthSignedMessageHash();
        address signer = ethHash.recover(signature);
        require(signer == owner, "invalid signer");

        nonce += 1;
        dailySpent += value;

        (bool ok, bytes memory ret) = to.call{value: value}(data);
        require(ok, "call failed");

        emit Executed(to, value, data, signer);
        return ret;
    }

    function withdrawETH(address payable to, uint256 amount) external {
        require(msg.sender == governor, "only governor");
        require(address(this).balance >= amount, "insufficient");
        to.transfer(amount);
        emit Withdraw(to, amount);
    }

    function withdrawERC20(IERC20 token, address to, uint256 amount) external {
        require(msg.sender == governor, "only governor");
        require(token.transfer(to, amount), "transfer failed");
        emit Withdraw(to, amount);
    }
}
