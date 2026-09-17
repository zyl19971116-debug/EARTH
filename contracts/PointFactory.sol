// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PointToken.sol";

interface ICityBondingCurve {
    function configureCity(
        address token,
        address cityDevWallet,
        uint256 nativeReserve,
        uint256 tokenReserve
    ) external payable;
}

/// @notice Permissionless city-token factory for the initial EARTH//ONLINE map.
/// Each listed city can be launched exactly once. There are no pre-launched tokens.
contract PointFactory {
    uint256 public constant CITY_TOKEN_SUPPLY = 1_000_000_000 ether;

    struct City {
        string name;
        string symbol;
        string region;
        string landmark;
        uint8 populationRank;
        bool launched;
        address token;
        address creator;
        address communityWallet;
        uint64 launchedAt;
    }

    ICityBondingCurve public immutable bondingCurve;
    bytes32[] private cityKeys;
    mapping(bytes32 => City) private cities;

    event CityTokenLaunched(
        bytes32 indexed cityKey,
        address indexed token,
        address indexed creator,
        address communityWallet,
        string name,
        string symbol,
        string region
    );

    constructor(address bondingCurve_) {
        require(bondingCurve_ != address(0), "bonding curve");
        bondingCurve = ICityBondingCurve(bondingCurve_);

        _add("IST", "Istanbul", "Europe", "Hagia Sophia", 1);
        _add("MOW", "Moscow", "Europe", "Saint Basil's Cathedral", 2);
        _add("LDN", "London", "Europe", "Big Ben", 3);
        _add("PAR", "Paris", "Europe", "Eiffel Tower", 4);
        _add("MAD", "Madrid", "Europe", "Puerta de Alcala", 5);
        _add("BCN", "Barcelona", "Europe", "Sagrada Familia", 6);

        _add("MEX", "Mexico City", "North America", "Angel of Independence", 1);
        _add("NYC", "New York City", "North America", "Statue of Liberty", 2);
        _add("LAX", "Los Angeles", "North America", "Hollywood Sign", 3);
        _add("TOR", "Toronto", "North America", "CN Tower", 4);
        _add("SDQ", "Santo Domingo", "North America", "Columbus Lighthouse", 5);
        _add("GDL", "Guadalajara", "North America", "Guadalajara Cathedral", 6);

        _add("SAO", "Sao Paulo", "South America", "Altino Arantes Building", 1);
        _add("BUE", "Buenos Aires", "South America", "Obelisk", 2);
        _add("BOG", "Bogota", "South America", "Monserrate", 3);
        _add("LIM", "Lima", "South America", "Plaza Mayor", 4);
        _add("RIO", "Rio de Janeiro", "South America", "Christ the Redeemer", 5);
        _add("SCL", "Santiago", "South America", "Gran Torre Santiago", 6);
    }

    /// @notice Launch a listed city and seed its curve with native currency.
    /// Reverts forever if the city has already been launched.
    function launchCityToken(
        bytes32 cityKey,
        string calldata imageURI,
        string calldata description
    ) external payable returns (address tokenAddress) {
        City storage city = cities[cityKey];
        require(bytes(city.symbol).length != 0, "unknown city");
        require(!city.launched, "city already launched");
        require(msg.value > 0, "curve seed");

        // Effects first: duplicate launches are blocked before external calls.
        city.launched = true;
        city.creator = msg.sender;
        city.communityWallet = msg.sender;
        city.launchedAt = uint64(block.timestamp);

        PointToken token = new PointToken(city.name, city.symbol, address(bondingCurve), CITY_TOKEN_SUPPLY);
        tokenAddress = address(token);
        city.token = tokenAddress;

        bondingCurve.configureCity{value: msg.value}(
            tokenAddress,
            msg.sender,
            msg.value,
            CITY_TOKEN_SUPPLY
        );

        // Metadata is emitted for indexers without granting mutable token controls.
        emit CityTokenLaunched(cityKey, tokenAddress, msg.sender, msg.sender, city.name, city.symbol, city.region);
        emit CityMetadata(cityKey, imageURI, description, city.landmark);
    }

    event CityMetadata(bytes32 indexed cityKey, string imageURI, string description, string landmark);

    function cityKeyFor(string memory symbol) public pure returns (bytes32) {
        return keccak256(bytes(symbol));
    }

    function getCity(bytes32 cityKey) external view returns (City memory) {
        return cities[cityKey];
    }

    function getAllCities() external view returns (City[] memory result) {
        result = new City[](cityKeys.length);
        for (uint256 i; i < cityKeys.length; ++i) result[i] = cities[cityKeys[i]];
    }

    function getAvailableCities() external view returns (City[] memory result) {
        uint256 count;
        for (uint256 i; i < cityKeys.length; ++i) {
            if (!cities[cityKeys[i]].launched) ++count;
        }
        result = new City[](count);
        uint256 cursor;
        for (uint256 i; i < cityKeys.length; ++i) {
            City storage city = cities[cityKeys[i]];
            if (!city.launched) result[cursor++] = city;
        }
    }

    function cityCount() external view returns (uint256) {
        return cityKeys.length;
    }

    function launchedCount() external view returns (uint256 count) {
        for (uint256 i; i < cityKeys.length; ++i) {
            if (cities[cityKeys[i]].launched) ++count;
        }
    }

    function _add(string memory symbol, string memory name, string memory region, string memory landmark, uint8 rank) internal {
        bytes32 key = cityKeyFor(symbol);
        require(bytes(cities[key].symbol).length == 0, "duplicate city");
        cities[key] = City(name, symbol, region, landmark, rank, false, address(0), address(0), address(0), 0);
        cityKeys.push(key);
    }
}
