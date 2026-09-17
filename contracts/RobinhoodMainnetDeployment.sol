// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./EarthBuybackExecutor.sol";
import "./BondingCurve.sol";
import "./PointFactory.sol";

/// @notice One-transaction, immutable deployment of the EARTH city launchpad.
contract RobinhoodMainnetDeployment {
    address public constant EARTH_TOKEN = 0xd9731Ac1557fb22c5b51B348aA06CA73B920b9c2;
    address public constant PONS_EARTH_CURVE = 0x14ee0C70DF1f2A9eBA9aA375B1880fBD63911306;
    address public constant MAIN_COMMUNITY_WALLET = 0xbA0eE0bc41407F797a88D7e12A922517a82EA599;
    address public constant BUYBACK_RECIPIENT = 0xeD370d524dd0A883d7147d6dFdB1F9FE2ec77E26;

    EarthBuybackExecutor public immutable buybackExecutor;
    BondingCurve public immutable bondingCurve;
    PointFactory public immutable pointFactory;

    event MainnetSystemDeployed(
        address indexed deployer,
        address buybackExecutor,
        address bondingCurve,
        address pointFactory,
        address earthToken
    );

    constructor() {
        require(block.chainid == 4663, "Robinhood mainnet only");
        require(EARTH_TOKEN.code.length > 0 && PONS_EARTH_CURVE.code.length > 0, "Pons contracts missing");

        EarthBuybackExecutor executor = new EarthBuybackExecutor(EARTH_TOKEN, PONS_EARTH_CURVE, 500);
        BondingCurve curve = new BondingCurve(
            30 ether,
            EARTH_TOKEN,
            MAIN_COMMUNITY_WALLET,
            address(executor),
            BUYBACK_RECIPIENT,
            0.001 ether
        );
        PointFactory factory = new PointFactory(address(curve));
        executor.setBondingCurve(address(curve));
        curve.setFactory(address(factory));
        factory.bindMainToken();

        buybackExecutor = executor;
        bondingCurve = curve;
        pointFactory = factory;
        emit MainnetSystemDeployed(msg.sender, address(executor), address(curve), address(factory), EARTH_TOKEN);
    }
}
