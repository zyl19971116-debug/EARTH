// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Lite {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @dev The executor must swap all received native currency for EARTH and send
/// the purchased tokens to recipient. Router/slippage protection belongs here.
interface IEarthBuybackExecutor {
    function buyback(address earthToken, address recipient) external payable returns (uint256 earthBought);
}

contract BondingCurve {
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant TRADE_TAX_BPS = 200; // Fixed 2% buy/sell tax.
    uint256 public constant BUYBACK_SHARE_BPS = 5_000;
    uint256 public constant CITY_DEV_SHARE_BPS = 3_000;

    enum TokenType { Unconfigured, Earth, City }
    struct TokenConfig { TokenType tokenType; address cityDevWallet; }

    uint256 public immutable graduationMarketCap;
    address public immutable earthToken;
    address public immutable mainDevWallet;
    address public immutable buybackRecipient;
    IEarthBuybackExecutor public immutable buybackExecutor;
    address public owner;
    address public factory;

    mapping(address => uint256) public virtualEthReserve;
    mapping(address => uint256) public virtualTokenReserve;
    mapping(address => bool) public graduated;
    mapping(address => TokenConfig) public tokenConfig;
    uint256 private locked = 1;

    event TokenConfigured(address indexed token, TokenType tokenType, address indexed cityDevWallet);
    event Trade(address indexed token, address indexed user, bool buy, uint256 input, uint256 output, uint256 tax);
    event TaxDistributed(address indexed token, uint256 totalTax, uint256 earthBuyback, uint256 cityCommunity, uint256 mainCommunity);
    event Graduated(address indexed token);

    modifier onlyOwner() { require(msg.sender == owner, "owner"); _; }
    modifier onlyOwnerOrFactory() { require(msg.sender == owner || msg.sender == factory, "configurator"); _; }
    modifier nonReentrant() { require(locked == 1, "reentrancy"); locked = 2; _; locked = 1; }

    constructor(
        uint256 cap,
        address earthToken_,
        address mainDevWallet_,
        address buybackExecutor_,
        address buybackRecipient_
    ) {
        require(cap > 0, "cap");
        require(earthToken_ != address(0), "earth token");
        require(mainDevWallet_ != address(0), "main dev");
        require(buybackExecutor_ != address(0), "buyback executor");
        require(buybackRecipient_ != address(0), "buyback recipient");
        graduationMarketCap = cap;
        earthToken = earthToken_;
        mainDevWallet = mainDevWallet_;
        buybackExecutor = IEarthBuybackExecutor(buybackExecutor_);
        buybackRecipient = buybackRecipient_;
        owner = msg.sender;
    }

    /// @notice EARTH 2% tax: 50% buyback, 50% main community.
    function setFactory(address factory_) external onlyOwner {
        require(factory == address(0), "factory already set");
        require(factory_ != address(0), "factory");
        factory = factory_;
    }

    function configureEarth(uint256 ethReserve, uint256 tokenReserve) external payable onlyOwner {
        require(msg.value == ethReserve, "seed value");
        _configure(earthToken, TokenType.Earth, address(0), ethReserve, tokenReserve);
    }

    /// @notice City 2% tax: 50% EARTH buyback, 30% city community,
    /// 20% main community.
    function configureCity(address token, address cityDevWallet, uint256 ethReserve, uint256 tokenReserve) external payable onlyOwnerOrFactory {
        require(msg.value == ethReserve, "seed value");
        require(token != earthToken, "earth is main token");
        require(cityDevWallet != address(0), "city dev");
        _configure(token, TokenType.City, cityDevWallet, ethReserve, tokenReserve);
    }

    function _configure(address token, TokenType kind, address cityDevWallet, uint256 ethReserve, uint256 tokenReserve) internal {
        require(token != address(0), "token");
        require(tokenConfig[token].tokenType == TokenType.Unconfigured, "configured");
        require(ethReserve > 0 && tokenReserve > 0, "reserves");
        tokenConfig[token] = TokenConfig(kind, cityDevWallet);
        virtualEthReserve[token] = ethReserve;
        virtualTokenReserve[token] = tokenReserve;
        emit TokenConfigured(token, kind, cityDevWallet);
    }

    function getBuyPrice(address token, uint256 ethIn) public view returns (uint256) {
        _requireTradable(token);
        uint256 netEthIn = ethIn - _tax(ethIn);
        uint256 x = virtualEthReserve[token];
        uint256 y = virtualTokenReserve[token];
        return y - (x * y) / (x + netEthIn);
    }

    function getSellPrice(address token, uint256 tokenIn) public view returns (uint256) {
        _requireTradable(token);
        uint256 x = virtualEthReserve[token];
        uint256 y = virtualTokenReserve[token];
        uint256 grossEthOut = x - (x * y) / (y + tokenIn);
        return grossEthOut - _tax(grossEthOut);
    }

    function buy(address token, uint256 minTokenOut) external payable nonReentrant {
        _requireTradable(token);
        require(msg.value > 0, "zero input");
        uint256 tax = _tax(msg.value);
        uint256 netEthIn = msg.value - tax;
        uint256 x = virtualEthReserve[token];
        uint256 y = virtualTokenReserve[token];
        uint256 tokenOut = y - (x * y) / (x + netEthIn);
        require(tokenOut >= minTokenOut && tokenOut > 0, "slippage");
        virtualEthReserve[token] = x + netEthIn;
        virtualTokenReserve[token] = y - tokenOut;
        require(IERC20Lite(token).transfer(msg.sender, tokenOut), "token transfer");
        _distributeTax(token, tax);
        emit Trade(token, msg.sender, true, msg.value, tokenOut, tax);
    }

    function sell(address token, uint256 tokenAmount, uint256 minEthOut) external nonReentrant {
        _requireTradable(token);
        require(tokenAmount > 0, "zero input");
        uint256 x = virtualEthReserve[token];
        uint256 y = virtualTokenReserve[token];
        uint256 grossEthOut = x - (x * y) / (y + tokenAmount);
        uint256 tax = _tax(grossEthOut);
        uint256 netEthOut = grossEthOut - tax;
        require(netEthOut >= minEthOut && netEthOut > 0, "slippage");
        require(IERC20Lite(token).transferFrom(msg.sender, address(this), tokenAmount), "token transfer");
        virtualTokenReserve[token] = y + tokenAmount;
        virtualEthReserve[token] = x - grossEthOut;
        _sendNative(payable(msg.sender), netEthOut);
        _distributeTax(token, tax);
        emit Trade(token, msg.sender, false, tokenAmount, netEthOut, tax);
    }

    function _distributeTax(address token, uint256 tax) internal {
        uint256 buybackAmount = tax * BUYBACK_SHARE_BPS / BPS_DENOMINATOR;
        uint256 cityAmount;
        uint256 mainAmount;
        if (tokenConfig[token].tokenType == TokenType.Earth) {
            mainAmount = tax - buybackAmount;
        } else {
            cityAmount = tax * CITY_DEV_SHARE_BPS / BPS_DENOMINATOR;
            mainAmount = tax - buybackAmount - cityAmount;
            _sendNative(payable(tokenConfig[token].cityDevWallet), cityAmount);
        }
        _sendNative(payable(mainDevWallet), mainAmount);
        uint256 earthBought = buybackExecutor.buyback{value: buybackAmount}(earthToken, buybackRecipient);
        require(earthBought > 0, "buyback failed");
        emit TaxDistributed(token, tax, buybackAmount, cityAmount, mainAmount);
    }

    function _tax(uint256 amount) internal pure returns (uint256) { return amount * TRADE_TAX_BPS / BPS_DENOMINATOR; }

    function _requireTradable(address token) internal view {
        require(tokenConfig[token].tokenType != TokenType.Unconfigured, "unconfigured");
        require(!graduated[token], "graduated");
    }

    function _sendNative(address payable recipient, uint256 amount) internal {
        if (amount == 0) return;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "native transfer");
    }

    function getMarketCap(address token) public view returns (uint256) { return virtualEthReserve[token] * 2; }

    function getProgress(address token) external view returns (uint256) {
        uint256 cap = getMarketCap(token);
        return cap >= graduationMarketCap ? 100 : cap * 100 / graduationMarketCap;
    }

    function graduate(address token) external {
        require(tokenConfig[token].tokenType != TokenType.Unconfigured, "unconfigured");
        require(getMarketCap(token) >= graduationMarketCap, "threshold");
        graduated[token] = true;
        emit Graduated(token);
    }
}
