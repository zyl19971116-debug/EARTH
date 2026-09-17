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

    // Pons V2 curve-compatible surface used by the production buyback adapter.
    function token() external view returns (address) { return earthToken; }
    function isNativeQuote() external pure returns (bool) { return true; }
    function graduated() external pure returns (bool) { return false; }
    function getReserves() external pure returns (uint256, uint256) { return (1 ether, 10_000 ether); }
    function sellableTokens() external pure returns (uint256) { return 10_000 ether; }
    function feeBps() external pure returns (uint256) { return 0; }
    function creatorTaxBps() external pure returns (uint256) { return 0; }
    function currentSnipeTaxBps(address) external pure returns (uint256) { return 0; }

    function buy(uint256 quoteIn, uint256 minTokensOut, address recipient)
        external payable returns (uint256 tokensOut)
    {
        require(swapsEnabled, "test swap disabled");
        require(msg.value == quoteIn, "quote value");
        tokensOut = quoteIn * 10_000 ether / (1 ether + quoteIn);
        require(tokensOut >= minTokensOut, "minimum output");
        require(ITestEarthToken(earthToken).transfer(recipient, tokensOut), "earth transfer");
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
