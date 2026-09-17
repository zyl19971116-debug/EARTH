# EARTH ONLINE — Robinhood Chain deployment

Robinhood Chain is EVM-compatible and uses ETH for gas.

| Network | Chain ID | RPC | Explorer |
| --- | ---: | --- | --- |
| Mainnet | 4663 | `https://rpc.mainnet.chain.robinhood.com` | `https://robinhoodchain.blockscout.com` |
| Testnet | 46630 | `https://rpc.testnet.chain.robinhood.com` | `https://explorer.testnet.chain.robinhood.com` |

## Safety prerequisites

1. Deploy and test on Robinhood Chain Testnet first.
2. Independently audit all contracts before mainnet use.
3. Confirm the Pons token and curve addresses from the official source and chain explorer.
4. Confirm that EARTH has not graduated before deployment. The current adapter
   trades against its native-quoted Pons V2 curve; failed buys are deferred.
5. Keep the deployer private key outside the repository.

## Configuration

Copy `.env.robinhood.example` to a private environment file and replace every
placeholder. The production deployment script rejects missing or zero wallet
addresses and refuses to run on any chain other than Robinhood mainnet 4663.

The main-token community / DEV wallet is
`0xbA0eE0bc41407F797a88D7e12A922517a82EA599`, recorded as
`mainCommunityWallet` in `config/robinhood-wallets.json`. It is bound immutably
when `BondingCurve` is deployed and accrues the 20% main-community share of
city-token fees. The buyback recipient remains a separate deployment setting.
These are public recipient addresses only; no private key is stored in the
repository.

## Commands

```bash
npm run contracts:compile
# Mainnet only after independent audit and final parameter review:
npm run contracts:deploy:robinhood
```

The production script pins EARTH to token
`0xd9731Ac1557fb22c5b51B348aA06CA73B920b9c2` and its Pons V2 curve
`0x14ee0C70DF1f2A9eBA9aA375B1880fBD63911306`. It verifies bytecode, token/curve
association, native quote asset and graduation state before deployment.

## Deployment order performed by the script

`$EARTH` is launched separately through Pons. Set its immutable mainnet token
address as `PONS_EARTH_TOKEN_ADDRESS`; the script verifies that it contains
contract bytecode and never deploys a replacement main token.

1. `EarthBuybackExecutor(Pons EARTH token, Pons EARTH curve, slippageBps)`
2. `BondingCurve(cap, Pons EARTH token, mainCommunityWallet, buybackExecutor,
   buybackRecipient, minimumNativeTrade)`
3. `PointFactory(bondingCurve)`
4. One-time wiring of the executor and factory.
5. `PointFactory.bindMainToken()` verifies the Pons EARTH contract bytecode and
   permanently records the same address held by `BondingCurve`. Until this
   transaction succeeds, every city-token launch reverts with
   `main token not bound`; the bound address cannot be replaced.

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

Buybacks are attempted during each trade. If the Pons curve, liquidity or
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

If EARTH graduates to Uniswap V4, new city trades keep working and their
buyback shares accumulate in `pendingBuybackNative`; they must not be retried
until a separately reviewed V4 adapter/migration is deployed. No administrator
can silently redirect this executor to a different market.

The tax applies to trades executed through `BondingCurve`. Plain ERC-20 wallet
transfers or unrelated third-party markets are not taxed by this architecture.
