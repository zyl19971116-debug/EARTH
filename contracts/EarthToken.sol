// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PointToken.sol";

/// @notice Fixed-supply main token. No owner mint, blacklist or mutable tax.
contract EarthToken is PointToken {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 ether;

    constructor(address treasury)
        PointToken("EARTH Online", "EARTH", treasury, INITIAL_SUPPLY)
    {
        require(treasury != address(0), "treasury");
    }
}
