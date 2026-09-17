// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITestEarthToken {
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @notice Testnet-only fixed-rate router used to exercise EARTH buybacks.
/// It is not a production DEX and must never be used on mainnet.
contract RobinhoodTestRouter {
    uint256 public constant EARTH_PER_ETH = 10_000 ether;
    address public immutable earthToken;
    address public immutable owner;
    bool public swapsEnabled = true;

    constructor(address earthToken_) {
        require(earthToken_ != address(0), "earth token");
        earthToken = earthToken_;
        owner = msg.sender;
    }

    function setSwapsEnabled(bool enabled) external {
        require(msg.sender == owner, "owner");
        swapsEnabled = enabled;
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external view returns (uint256[] memory amounts)
    {
        require(path.length == 2 && path[1] == earthToken, "test route");
        require(swapsEnabled, "test swap disabled");
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountIn * EARTH_PER_ETH / 1 ether;
    }

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable {
        require(block.timestamp <= deadline, "expired");
        require(swapsEnabled, "test swap disabled");
        require(path.length == 2 && path[1] == earthToken, "test route");
        uint256 amountOut = msg.value * EARTH_PER_ETH / 1 ether;
        require(amountOut >= amountOutMin, "minimum output");
        require(ITestEarthToken(earthToken).transfer(to, amountOut), "earth transfer");
    }
}
