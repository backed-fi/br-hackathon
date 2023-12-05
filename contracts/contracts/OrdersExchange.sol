/**
 * SPDX-License-Identifier: MIT
 *
 * Copyright (c) 2021-2023 Backed Finance AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "hardhat/console.sol";

error NonWhitelistedFromAddress (address from);
error UnsupportedToken (address token);

struct TokenDetails {
    bool enabled;
    uint256 idCounter;
    uint256 currentEpoch;
}

struct EpochDetails {
    address token;
    uint256 valueBought;
    uint256 amountSold;
    bool settled;
    uint256 settledAt;
    uint256 executionPrice;
    uint256[] ordersIds;
}

struct OrderDetails {
    address token;
    uint256 amount;
    address recipient;
    bool isBuyOrder;
    uint256 createdAt;
}

/**
 * @dev
 *
 * OrdersExchange contract, which is responsible for 
 * 
 */
contract OrdersExchange is PausableUpgradeable, OwnableUpgradeable  {
    /// @custom:oz-upgrades-unsafe-allow constructor
    using SafeERC20 for IERC20;

    // WhitelistController public whitelistController;
    address public stablecoin;
    uint256 public stablecoinScaleFactor;
    mapping(address => TokenDetails) public availableTokens;
    address[] public availableTokensList;
    mapping(address => OrderDetails[]) public orders;
    mapping(address => mapping(address => uint256[])) public userTokenOrders;
    mapping(address => EpochDetails[]) public epochDetails;

    modifier isWhitelisted(address token) {
        require(availableTokens[token].enabled, "Token not enabled");
        _;
    }


    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes new instance of orders exchange
     * 
     */
    function initialize(address _stablecoin) initializer external {
        __Pausable_init();
        __Ownable_init(msg.sender);
        stablecoin = _stablecoin;
        stablecoinScaleFactor = 10**(18 - IERC20Metadata(_stablecoin).decimals());
    }

    /**
     * @dev Schedules a new order for execution, which will be triggered by the admin
     * by the end of the day usually. Requires approving relevant token transfer to
     * the exchange contract
     * 
     */
    function scheduleOrder(address token, uint256 amount, bool buyOrder) public isWhitelisted(token) returns (uint256) {
        uint256 orderId = availableTokens[token].idCounter++;
        orders[token].push(OrderDetails({
            token: token,
            amount: amount,
            isBuyOrder: buyOrder,
            recipient: msg.sender,
            createdAt: block.timestamp
        }));
        uint256 currentEpoch = availableTokens[token].currentEpoch;
        epochDetails[token][currentEpoch].ordersIds.push(orderId);
        if(buyOrder) {
          epochDetails[token][currentEpoch].valueBought += amount;  
        } else {
          epochDetails[token][currentEpoch].amountSold += amount;  
        }
        userTokenOrders[msg.sender][token].push(orderId);
        address tokenToPull = buyOrder ? stablecoin : token;
        IERC20(tokenToPull).safeTransferFrom(msg.sender, address(this), amount);
        return orderId;
    }

    /**
     * @dev Variant of scheduleOrder function, which does not require separate approval,
     * but instead accepts user signature for Permit function.
     * 
     */
    function scheduleOrderWithPermit(address token, uint256 amount, bool buyOrder,uint deadline, uint8 v, bytes32 r, bytes32 s) external isWhitelisted(token) returns (uint256) {
        IERC20Permit(buyOrder ? stablecoin : token).permit(msg.sender, address(this), amount, deadline, v, r, s);
        scheduleOrder(token, amount,buyOrder);
    }

    /**
     * @dev Register new t-bill token, that can be exchanged via this contract
     * 
     */
    function registerToken(address token) external onlyOwner {
        require(!availableTokens[token].enabled, "Token already added");
        availableTokensList.push(token);
        availableTokens[token] = TokenDetails({
            enabled: true,
            idCounter: 0,
            currentEpoch: 0
        });
        epochDetails[token].push(EpochDetails({
            token: token,
            valueBought: 0,
            amountSold: 0,
            settled: false,
            settledAt: 0,
            executionPrice: 0,
            ordersIds: new uint256[](0)
        }));
    }

    /**
     * @dev Marks end of accepting orders into the epoch. Epochs are the period
     * within which admin is going to net out orders. Callable only by the owner of the contract.
     * 
     */
    function closeEpoch(address token, uint256 epochId) external onlyOwner {
        uint256 closedEpoch = availableTokens[token].currentEpoch++;
        epochDetails[token].push(EpochDetails({
            token: token,
            valueBought: 0,
            amountSold: 0,
            settled: false,
            settledAt: 0,
            executionPrice: 0,
            ordersIds: new uint256[](0)
        }));
        require(epochId == closedEpoch, "Wrong epoch closed");
        require(closedEpoch == 0 || epochDetails[token][closedEpoch-1].settled, "Previous epoch not settled yet");
    }

    /**
     * @dev Submits information about trade settlement (especially execution price)
     * Callable only by the owner of the contract.
     * 
     */
    function settleOrders(address token, uint256 price, uint256 epochId) external onlyOwner {
        EpochDetails storage epoch = epochDetails[token][epochId];
        uint256 soldValue = epoch.amountSold * price / 1e18 / stablecoinScaleFactor;
        epoch.settled = true;
        epoch.executionPrice = price;
        epoch.settledAt = block.timestamp;

        if(soldValue > epoch.valueBought) {
            IERC20(stablecoin).safeTransferFrom(msg.sender, address(this), (soldValue - epoch.valueBought));
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), epoch.valueBought * stablecoinScaleFactor * 1e18 / price - epoch.amountSold);
        }

        for(uint256 idx = 0; idx < epoch.ordersIds.length; idx++) {
            OrderDetails storage order = orders[token][epoch.ordersIds[idx]];
            if(order.isBuyOrder) {
                IERC20(token).safeTransfer(order.recipient, order.amount * stablecoinScaleFactor * 1e18 / price);
            } else {
                IERC20(stablecoin).safeTransfer(order.recipient, order.amount * price / 1e18 / stablecoinScaleFactor);
            }
        }
    }

    /**
     * @dev View function for retrieving all orders for given epoch
     * 
     */
    function epochOrders(address token, uint256 epochId) external view returns (OrderDetails[] memory) {
        EpochDetails storage epoch = epochDetails[token][epochId];
        OrderDetails[] memory fetchedOrders = new OrderDetails[](epoch.ordersIds.length);
        for(uint256 idx = 0; idx < epoch.ordersIds.length; idx++) {
            OrderDetails storage order = orders[token][epoch.ordersIds[idx]];
            fetchedOrders[idx] = order;
        }
        return fetchedOrders;
    }

    /**
     * @dev View function for retrieving all orders for given epoch
     * 
     */
    function userOrders(address user, address token) external view returns (OrderDetails[] memory) {
        uint256 ordersLength = 0;
        for(uint256 tokenIdx = 0; tokenIdx < availableTokensList.length; tokenIdx++) {
            address tokenAddress = availableTokensList[tokenIdx];
            ordersLength += userTokenOrders[user][tokenAddress].length;
        }

        OrderDetails[] memory fetchedOrders = new OrderDetails[](ordersLength);
        for(uint256 tokenIdx = 0; tokenIdx < availableTokensList.length; tokenIdx++) {
            address tokenAddress = availableTokensList[tokenIdx];
            for(uint256 idx = 0; idx < userTokenOrders[user][tokenAddress].length; idx++) {
                OrderDetails storage order = orders[token][userTokenOrders[user][tokenAddress][idx]];
                fetchedOrders[idx] = order;
            }
        }
        return fetchedOrders;
    }

    /**
     * @dev View function for retrieving all available tokens
     * 
     */
    function allAvailableTokens() external view returns (TokenDetails[] memory) {
        TokenDetails[] memory tokens = new TokenDetails[](availableTokensList.length);
        for(uint256 idx = 0; idx < availableTokensList.length; idx++) {
            TokenDetails storage details = availableTokens[availableTokensList[idx]];
            tokens[idx] = details;
        }
        return tokens;
    }
}