# EARTH ONLINE — Robinhood Chain deployment

Robinhood Chain is EVM-compatible and uses ETH for gas.

| Network | Chain ID | RPC | Explorer |
| --- | ---: | --- | --- |
| Mainnet | 4663 | `https://rpc.mainnet.chain.robinhood.com` | `https://robinhoodchain.blockscout.com` |
| Testnet | 46630 | `https://rpc.testnet.chain.robinhood.com` | `https://explorer.testnet.chain.robinhood.com` |

## Safety prerequisites

1. Deploy and test on Robinhood Chain Testnet first.
2. Independently audit all contracts before mainnet use.
3. Confirm the DEX router and wrapped-native addresses from authoritative sources.
4. Create the EARTH/WETH liquidity route before enabling trades. The buyback
   executor deliberately reverts when no valid route or minimum output exists.
5. Keep the deployer private key outside the repository.

## Configuration

Copy `.env.robinhood.example` to a private environment file and replace every
placeholder. The deployment script rejects missing or zero wallet/router
addresses and refuses to run on any chain other than 4663 or 46630.

## Commands

```bash
npm run contracts:compile
npm run contracts:deploy:robinhood-testnet
# Mainnet only after testnet validation and audit:
npm run contracts:deploy:robinhood
```

## Deployment order performed by the script

1. `EarthToken(treasury)`
2. `EarthBuybackExecutor(router, wrappedNative, slippageBps)`
3. `BondingCurve(cap, earthToken, mainCommunityWallet, buybackExecutor,
   buybackRecipient, minimumNativeTrade)`
4. `PointFactory(bondingCurve)`
5. One-time wiring of the executor and factory.

After deployment, transfer the EARTH reserve into `BondingCurve`, then call
`configureEarth{value: nativeSeed}(nativeSeed, earthTokenReserve)`. This call
verifies that the token reserve is actually funded.

City creators call `PointFactory.launchCityToken{value: nativeSeed}(...)` from
the wallet that should permanently receive the city community's 30% fee share.
The factory rejects unknown cities and duplicate launches.

Both EARTH and city-token curve buys/sells have an immutable 2% tax. EARTH tax
is split 50% buyback / 50% main community. City-token tax is split 50% EARTH
buyback / 30% city community / 20% main community. These percentages have no
administrator setter. Minimum native trade value is immutable per deployment,
all trade entry points are reentrancy guarded, user minimum-output protection is
required, and distribution/trade/buyback events are emitted onchain.

The tax applies to trades executed through `BondingCurve`. Plain ERC-20 wallet
transfers or unrelated third-party markets are not taxed by this architecture.
