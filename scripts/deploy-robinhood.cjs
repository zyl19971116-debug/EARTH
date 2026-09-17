/* eslint-disable @typescript-eslint/no-require-imports */
const hre = require("hardhat");
const configuredWallets = require("../config/robinhood-wallets.json");

const ROBINHOOD_MAINNET_CHAIN_ID = 4663n;
const UNISWAP_V2_ROUTER = "0x89e5db8b5aa49aa85ac63f691524311aeb649eba";
const WETH = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73";

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
  const dexRouter = requiredAddress("ROBINHOOD_DEX_ROUTER", UNISWAP_V2_ROUTER);
  const wrappedNative = requiredAddress("ROBINHOOD_WRAPPED_NATIVE", WETH);
  const earthToken = requiredAddress("PONS_EARTH_TOKEN_ADDRESS");

  const graduationCap = hre.ethers.parseEther(process.env.GRADUATION_MARKET_CAP_ETH || "30");
  const minimumTrade = hre.ethers.parseEther(process.env.MINIMUM_TRADE_ETH || "0.001");
  const slippageBps = Number(process.env.BUYBACK_SLIPPAGE_BPS || "500");

  console.log(`Network chain ID: ${network.chainId}`);
  console.log(`Deployer: ${deployer.address}`);

  if ((await hre.ethers.provider.getCode(dexRouter)) === "0x") throw new Error("DEX router has no mainnet code");
  if ((await hre.ethers.provider.getCode(wrappedNative)) === "0x") throw new Error("WETH has no mainnet code");
  if ((await hre.ethers.provider.getCode(earthToken)) === "0x") throw new Error("Pons EARTH token has no mainnet code");
  const router = new hre.ethers.Contract(dexRouter, ["function WETH() view returns (address)"], hre.ethers.provider);
  const routerWeth = await router.WETH();
  if (routerWeth.toLowerCase() !== wrappedNative.toLowerCase()) throw new Error("Router WETH mismatch");
  console.log(`Verified Uniswap V2 Router02: ${dexRouter}`);
  console.log(`Verified WETH: ${wrappedNative}`);
  console.log(`Verified Pons EARTH token: ${earthToken}`);

  const buyback = await deploy("EarthBuybackExecutor", [dexRouter, wrappedNative, slippageBps]);
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

  console.log("Wiring complete.");
  console.log("NEXT_PUBLIC_ROBINHOOD_CHAIN_ID=" + network.chainId);
  console.log("NEXT_PUBLIC_EARTH_TOKEN_ADDRESS=" + earthToken);
  console.log("NEXT_PUBLIC_BONDING_CURVE_ADDRESS=" + await curve.getAddress());
  console.log("NEXT_PUBLIC_POINT_FACTORY_ADDRESS=" + await factory.getAddress());
  console.log("Important: confirm the Pons EARTH/WETH pool and deploy the matching buyback adapter before enabling city trading.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
