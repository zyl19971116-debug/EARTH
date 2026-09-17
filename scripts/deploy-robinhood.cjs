/* eslint-disable @typescript-eslint/no-require-imports */
const hre = require("hardhat");
const configuredWallets = require("../config/robinhood-wallets.json");

const ROBINHOOD_MAINNET_CHAIN_ID = 4663n;
const PONS_EARTH_TOKEN = "0xd9731Ac1557fb22c5b51B348aA06CA73B920b9c2";
const PONS_EARTH_CURVE = "0x14ee0C70DF1f2A9eBA9aA375B1880fBD63911306";

function requiredAddress(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value || !hre.ethers.isAddress(value) || value === hre.ethers.ZeroAddress) {
    throw new Error(`${name} must be a non-zero address`);
  }
  return value;
}

async function deploy(name, args) {
  const factory = await hre.ethers.getContractFactory(name);
  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`${name}: ${address}`);
  return contract;
}

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== ROBINHOOD_MAINNET_CHAIN_ID) {
    throw new Error(`Mainnet deployment requires Robinhood Chain ID 4663; connected to ${network.chainId}`);
  }

  const [deployer] = await hre.ethers.getSigners();
  const mainCommunityWallet = requiredAddress("MAIN_COMMUNITY_WALLET", configuredWallets.mainCommunityWallet);
  const buybackRecipient = requiredAddress("BUYBACK_RECIPIENT", configuredWallets.buybackRecipient);
  const earthToken = requiredAddress("PONS_EARTH_TOKEN_ADDRESS", PONS_EARTH_TOKEN);
  const ponsEarthCurve = requiredAddress("PONS_EARTH_CURVE_ADDRESS", PONS_EARTH_CURVE);

  const graduationCap = hre.ethers.parseEther(process.env.GRADUATION_MARKET_CAP_ETH || "30");
  const minimumTrade = hre.ethers.parseEther(process.env.MINIMUM_TRADE_ETH || "0.001");
  const slippageBps = Number(process.env.BUYBACK_SLIPPAGE_BPS || "500");

  console.log(`Network chain ID: ${network.chainId}`);
  console.log(`Deployer: ${deployer.address}`);

  if ((await hre.ethers.provider.getCode(earthToken)) === "0x") throw new Error("Pons EARTH token has no mainnet code");
  if ((await hre.ethers.provider.getCode(ponsEarthCurve)) === "0x") throw new Error("Pons EARTH curve has no mainnet code");
  const ponsCurve = new hre.ethers.Contract(ponsEarthCurve, ["function token() view returns (address)", "function isNativeQuote() view returns (bool)", "function graduated() view returns (bool)"], hre.ethers.provider);
  if ((await ponsCurve.token()).toLowerCase() !== earthToken.toLowerCase()) throw new Error("Pons curve token mismatch");
  if (!(await ponsCurve.isNativeQuote())) throw new Error("Pons EARTH curve is not native-quoted");
  if (await ponsCurve.graduated()) throw new Error("Pons EARTH has graduated; deploy a verified V4 buyback adapter");
  console.log(`Verified Pons EARTH token: ${earthToken}`);
  console.log(`Verified Pons EARTH curve: ${ponsEarthCurve}`);

  const buyback = await deploy("EarthBuybackExecutor", [earthToken, ponsEarthCurve, slippageBps]);
  const curve = await deploy("BondingCurve", [
    graduationCap,
    earthToken,
    mainCommunityWallet,
    await buyback.getAddress(),
    buybackRecipient,
    minimumTrade,
  ]);
  const factory = await deploy("PointFactory", [await curve.getAddress()]);

  await (await buyback.setBondingCurve(await curve.getAddress())).wait();
  await (await curve.setFactory(await factory.getAddress())).wait();
  await (await factory.bindMainToken()).wait();

  if (!(await factory.mainTokenBound())) throw new Error("Pons EARTH binding failed");
  if ((await factory.mainToken()).toLowerCase() !== earthToken.toLowerCase()) throw new Error("Bound main token mismatch");

  console.log("Wiring and one-time Pons EARTH binding complete. City launches are enabled.");
  console.log("NEXT_PUBLIC_ROBINHOOD_CHAIN_ID=" + network.chainId);
  console.log("NEXT_PUBLIC_EARTH_TOKEN_ADDRESS=" + earthToken);
  console.log("NEXT_PUBLIC_BONDING_CURVE_ADDRESS=" + await curve.getAddress());
  console.log("NEXT_PUBLIC_POINT_FACTORY_ADDRESS=" + await factory.getAddress());
  console.log("City launches are live. Failed Pons buybacks remain pending for permissionless retry.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
