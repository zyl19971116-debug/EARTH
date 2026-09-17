# EARTH//ONLINE deployment order

1. Deploy `EarthToken(treasury)`.
2. Deploy `EarthBuybackExecutor(router, wrappedNative, slippageBps)`.
3. Deploy `BondingCurve(cap, earthToken, mainDevWallet, buybackExecutor, buybackRecipient)`.
4. Call `EarthBuybackExecutor.setBondingCurve(bondingCurve)` once.
5. Deploy `PointFactory(bondingCurve)`.
6. Call `BondingCurve.setFactory(pointFactory)` once.
7. Transfer the EARTH amount reserved for its curve to `BondingCurve`, then call
   `configureEarth{value: nativeSeed}(nativeSeed, earthTokenReserve)`.

City creators call `PointFactory.launchCityToken{value: nativeSeed}(...)` from
the wallet that should receive the city creator's 30% fee share. The factory
uses `msg.sender` as the immutable city community wallet; no separate recipient
address can be supplied.
The factory rejects an unknown city and permanently rejects a second launch of
the same city. `getAvailableCities()` is the source of truth for the website.

The DEX router must implement the Uniswap-V2-compatible methods declared in
`EarthBuybackExecutor.sol`. Confirm the Robinhood Chain router and wrapped
native-token addresses before deployment. Contracts should be independently
audited before handling real funds.
