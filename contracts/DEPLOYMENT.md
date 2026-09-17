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
placeholder. The production deployment script rejects missing or zero wallet
addresses and refuses to run on any chain other than Robinhood mainnet 4663.

The current default community, buyback-recipient and EARTH treasury wallet is
`0xeD370d524dd0A883d7147d6dFdB1F9FE2ec77E26`, recorded in
`config/robinhood-wallets.json`. Environment variables can override these roles
before deployment. This is a public recipient address only; no private key is
stored in the repository.

## Commands

```bash
npm run contracts:compile
# Mainnet only after independent audit and final parameter review:
npm run contracts:deploy:robinhood
```

The production script defaults to the official Robinhood Chain Uniswap V2
Router02 `0x89e5db8b5aa49aa85ac63f691524311aeb649eba` and WETH
`0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73`. Before deploying any EARTH
contract, it checks that both addresses contain code and that the router's
`WETH()` result matches the configured wrapped-native address.

## Deployment order performed by the script

`$EARTH` is launched separately through Pons. Set its immutable mainnet token
address as `PONS_EARTH_TOKEN_ADDRESS`; the script verifies that it contains
contract bytecode and never deploys a replacement main token.

1. `EarthBuybackExecutor(router, wrappedNative, slippageBps)`
2. `BondingCurve(cap, Pons EARTH token, mainCommunityWallet, buybackExecutor,
   buybackRecipient, minimumNativeTrade)`
3. `PointFactory(bondingCurve)`
4. One-time wiring of the executor and factory.

City creators call `PointFactory.launchCityToken{value: nativeSeed}(...)` from
the wallet that should permanently receive the city community's 30% fee share.
The factory rejects unknown cities and duplicate launches.

Pons controls EARTH supply, trading and main-token fees. City-token curve
buys/sells have an immutable 2% tax split 50% EARTH buyback / 30% city
community / 20% main community. These percentages have no administrator
setter. Minimum native trade value is immutable per deployment,
all trade entry points are reentrancy guarded, user minimum-output protection is
required, and distribution/trade/buyback events are emitted onchain.

Community shares use pull payments: trading records each recipient's balance in
`claimableCommunityFees`, and the bound wallet calls `claimCommunityFees` to
withdraw. A recipient that cannot receive ETH therefore cannot block trading.
The website renders the claim control only when the connected address matches a
launched city's immutable creator address.

Buybacks are attempted during each trade. If the DEX route, liquidity or
slippage check fails, the trade continues and the 50% buyback share is recorded
in `pendingBuybackNative`. Anyone can later call `executePendingBuyback` for a
partial or full pending amount. A failed retry leaves the pending balance intact.
`BuybackDeferred` and `DeferredBuybackExecuted` provide an auditable lifecycle.
The GitHub Actions keeper calls the production `/api/cron/buyback` endpoint
every five minutes. The endpoint reads the pending balance and submits a retry
only when the balance is non-zero. Configure `BUYBACK_KEEPER_PRIVATE_KEY`,
`BONDING_CURVE_ADDRESS`, `ROBINHOOD_RPC_URL`, and `CRON_SECRET` as encrypted
Vercel environment values, and add the same `CRON_SECRET` as a GitHub Actions
secret. Never commit the keeper private key. The keeper wallet needs only enough
native currency for gas and does not custody protocol fees.

The tax applies to trades executed through `BondingCurve`. Plain ERC-20 wallet
transfers or unrelated third-party markets are not taxed by this architecture.
