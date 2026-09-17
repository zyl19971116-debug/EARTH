// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Balance { function balanceOf(address account) external view returns (uint256); }

interface IPonsV2BondingCurve {
    function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) external payable returns (uint256 tokensOut);
    function token() external view returns (address);
    function isNativeQuote() external view returns (bool);
    function graduated() external view returns (bool);
    function getReserves() external view returns (uint256 quoteReserve, uint256 tokenReserve);
    function sellableTokens() external view returns (uint256);
    function feeBps() external view returns (uint256);
    function creatorTaxBps() external view returns (uint256);
    function currentSnipeTaxBps(address recipient) external view returns (uint256);
}

/// @notice Converts city-token buyback fees into the Pons-issued EARTH token.
/// The adapter is permanently pinned to EARTH's verified Pons V2 curve.
contract EarthBuybackExecutor {
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant MAX_ALLOWED_SLIPPAGE_BPS = 1_000;
    address public bondingCurve;
    address public immutable owner;
    address public immutable earthToken;
    IPonsV2BondingCurve public immutable ponsCurve;
    uint256 public immutable slippageBps;

    event EarthBoughtBack(address indexed recipient, uint256 nativeSpent, uint256 earthBought);

    constructor(address earthToken_, address ponsCurve_, uint256 slippageBps_) {
        require(earthToken_ != address(0) && ponsCurve_ != address(0), "address");
        require(slippageBps_ <= MAX_ALLOWED_SLIPPAGE_BPS, "slippage too high");
        IPonsV2BondingCurve curve = IPonsV2BondingCurve(ponsCurve_);
        require(curve.token() == earthToken_, "Pons token mismatch");
        require(curve.isNativeQuote(), "Pons curve is not native");
        owner = msg.sender;
        earthToken = earthToken_;
        ponsCurve = curve;
        slippageBps = slippageBps_;
    }

    function setBondingCurve(address bondingCurve_) external {
        require(msg.sender == owner, "owner");
        require(bondingCurve == address(0), "curve already set");
        require(bondingCurve_ != address(0), "bonding curve");
        bondingCurve = bondingCurve_;
    }

    function quoteBuyback(uint256 quoteIn, address recipient) public view returns (uint256 tokensOut) {
        require(!ponsCurve.graduated(), "EARTH graduated");
        (uint256 quoteReserve, uint256 tokenReserve) = ponsCurve.getReserves();
        uint256 totalFeeBps = ponsCurve.feeBps() + ponsCurve.creatorTaxBps()
            + ponsCurve.currentSnipeTaxBps(recipient);
        if (totalFeeBps > 9_900) totalFeeBps = 9_900;
        uint256 netQuote = quoteIn * (BPS_DENOMINATOR - totalFeeBps) / BPS_DENOMINATOR;
        tokensOut = netQuote * tokenReserve / (quoteReserve + netQuote);
        uint256 sellable = ponsCurve.sellableTokens();
        if (tokensOut > sellable) tokensOut = sellable;
    }

    function buyback(address requestedEarthToken, address recipient) external payable returns (uint256 earthBought) {
        require(msg.sender == bondingCurve, "curve only");
        require(requestedEarthToken == earthToken && recipient != address(0), "address");
        require(msg.value > 0, "zero buyback");
        uint256 quotedOut = quoteBuyback(msg.value, recipient);
        require(quotedOut > 0, "no quote");
        uint256 minimumOut = quotedOut * (BPS_DENOMINATOR - slippageBps) / BPS_DENOMINATOR;
        uint256 balanceBefore = IERC20Balance(earthToken).balanceOf(recipient);
        ponsCurve.buy{value: msg.value}(msg.value, minimumOut, recipient);
        earthBought = IERC20Balance(earthToken).balanceOf(recipient) - balanceBefore;
        require(earthBought >= minimumOut, "insufficient output");
        emit EarthBoughtBack(recipient, msg.value, earthBought);
    }
}
