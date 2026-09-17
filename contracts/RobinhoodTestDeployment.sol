// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./EarthToken.sol";
import "./EarthBuybackExecutor.sol";
import "./BondingCurve.sol";
import "./PointFactory.sol";
import "./RobinhoodTestRouter.sol";

/// @notice One-transaction deployment harness for Robinhood Chain Testnet.
/// The mock router makes fee routing testable without claiming to be a live DEX.
contract RobinhoodTestDeployment {
    EarthToken public immutable earthToken;
    RobinhoodTestRouter public immutable testRouter;
    EarthBuybackExecutor public immutable buybackExecutor;
    BondingCurve public immutable bondingCurve;
    PointFactory public immutable pointFactory;
    address public immutable communityWallet;

    event TestSystemDeployed(
        address indexed communityWallet,
        address earthToken,
        address testRouter,
        address buybackExecutor,
        address bondingCurve,
        address pointFactory
    );

    constructor(address communityWallet_) payable {
        require(block.chainid == 46630, "Robinhood testnet only");
        require(communityWallet_ != address(0), "community wallet");
        require(msg.value >= 0.001 ether, "minimum seed");
        communityWallet = communityWallet_;

        EarthToken earth = new EarthToken(address(this));
        RobinhoodTestRouter router = new RobinhoodTestRouter(address(earth));
        EarthBuybackExecutor executor = new EarthBuybackExecutor(address(router), address(1), 500);
        BondingCurve curve = new BondingCurve(
            30 ether,
            address(earth),
            communityWallet_,
            address(executor),
            communityWallet_,
            0.00001 ether
        );
        PointFactory factory = new PointFactory(address(curve));

        executor.setBondingCurve(address(curve));
        curve.setFactory(address(factory));

        uint256 routerReserve = 100_000_000 ether;
        uint256 curveReserve = 800_000_000 ether;
        require(earth.transfer(address(router), routerReserve), "router reserve");
        require(earth.transfer(address(curve), curveReserve), "curve reserve");
        curve.configureEarth{value: msg.value}(msg.value, curveReserve);
        require(earth.transfer(communityWallet_, earth.balanceOf(address(this))), "treasury transfer");

        earthToken = earth;
        testRouter = router;
        buybackExecutor = executor;
        bondingCurve = curve;
        pointFactory = factory;

        emit TestSystemDeployed(
            communityWallet_,
            address(earth),
            address(router),
            address(executor),
            address(curve),
            address(factory)
        );
    }
}
