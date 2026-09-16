// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Balance {
    function balanceOf(address account) external view returns (uint256);
}

interface IUniswapV2RouterLike {
    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external view returns (uint256[] memory amounts);

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable;
}

/// @notice Converts the buyback share of every launchpad fee into EARTH.
/// Compatible with Uniswap-V2-style routers used by many EVM DEXes.
contract EarthBuybackExecutor {
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant MAX_ALLOWED_SLIPPAGE_BPS = 1_000; // Hard cap: 10%.

    address public bondingCurve;
    address public immutable owner;
    address public immutable wrappedNative;
    IUniswapV2RouterLike public immutable router;
    uint256 public immutable slippageBps;

    event EarthBoughtBack(address indexed recipient, uint256 nativeSpent, uint256 earthBought);

    constructor(
        address router_,
        address wrappedNative_,
        uint256 slippageBps_
    ) {
        require(router_ != address(0), "router");
        require(wrappedNative_ != address(0), "wrapped native");
        require(slippageBps_ <= MAX_ALLOWED_SLIPPAGE_BPS, "slippage too high");
        owner = msg.sender;
        router = IUniswapV2RouterLike(router_);
        wrappedNative = wrappedNative_;
        slippageBps = slippageBps_;
    }

    /// @notice One-time wiring step after the BondingCurve is deployed.
    function setBondingCurve(address bondingCurve_) external {
        require(msg.sender == owner, "owner");
        require(bondingCurve == address(0), "curve already set");
        require(bondingCurve_ != address(0), "bonding curve");
        bondingCurve = bondingCurve_;
    }

    function buyback(address earthToken, address recipient)
        external payable returns (uint256 earthBought)
    {
        require(msg.sender == bondingCurve, "curve only");
        require(earthToken != address(0) && recipient != address(0), "address");
        require(msg.value > 0, "zero buyback");

        address[] memory path = new address[](2);
        path[0] = wrappedNative;
        path[1] = earthToken;

        uint256[] memory quote = router.getAmountsOut(msg.value, path);
        require(quote.length == 2 && quote[1] > 0, "no route");
        uint256 minimumOut = quote[1] * (BPS_DENOMINATOR - slippageBps) / BPS_DENOMINATOR;

        uint256 balanceBefore = IERC20Balance(earthToken).balanceOf(recipient);
        router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: msg.value}(
            minimumOut,
            path,
            recipient,
            block.timestamp
        );
        earthBought = IERC20Balance(earthToken).balanceOf(recipient) - balanceBefore;
        require(earthBought >= minimumOut, "insufficient output");
        emit EarthBoughtBack(recipient, msg.value, earthBought);
    }
}
