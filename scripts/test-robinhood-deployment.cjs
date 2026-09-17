/* eslint-disable @typescript-eslint/no-require-imports */
const hre = require("hardhat");

async function main() {
  const [wallet] = await hre.ethers.getSigners();
  const factory = await hre.ethers.getContractFactory("RobinhoodTestDeployment");
  const deployment = await factory.deploy(wallet.address, { value: hre.ethers.parseEther("0.001") });
  await deployment.waitForDeployment();

  const earthAddress = await deployment.earthToken();
  const curveAddress = await deployment.bondingCurve();
  const cityFactoryAddress = await deployment.pointFactory();
  const earth = await hre.ethers.getContractAt("EarthToken", earthAddress);
  const curve = await hre.ethers.getContractAt("BondingCurve", curveAddress);

  if (await curve.EARTH_TRADE_TAX_BPS() !== 300n) throw new Error("EARTH tax is not fixed at 3%");
  if (await curve.CITY_TRADE_TAX_BPS() !== 200n) throw new Error("city tax is not fixed at 2%");
  if (await curve.mainDevWallet() !== wallet.address) throw new Error("community wallet mismatch");
  if (await earth.balanceOf(wallet.address) !== hre.ethers.parseEther("100000000")) throw new Error("treasury allocation mismatch");

  const claimBeforeEarthTrade = await curve.claimableCommunityFees(wallet.address);
  const quote = await curve.getBuyPrice(earthAddress, hre.ethers.parseEther("0.0001"));
  await (await curve.buy(earthAddress, quote * 99n / 100n, { value: hre.ethers.parseEther("0.0001") })).wait();
  if (await earth.balanceOf(wallet.address) <= hre.ethers.parseEther("100000000")) throw new Error("buy failed");
  if ((await curve.claimableCommunityFees(wallet.address)) - claimBeforeEarthTrade !== hre.ethers.parseEther("0.000003")) throw new Error("EARTH community fee mismatch");
  if (await curve.pendingBuybackNative() !== 0n) throw new Error("EARTH fees must not enter buyback");

  const factoryContract = await hre.ethers.getContractAt("PointFactory", cityFactoryAddress);
  const istKey = await factoryContract.cityKeyFor("IST");
  await (await factoryContract.launchCityToken(istKey, "/cities/istanbul.png", "pull-payment test", { value: hre.ethers.parseEther("0.001") })).wait();
  const ist = await factoryContract.getCity(istKey);
  const claimBeforeCityTrade = await curve.claimableCommunityFees(wallet.address);
  await (await deployment.setTestRouterEnabled(false)).wait();
  const cityQuote = await curve.getBuyPrice(ist.token, hre.ethers.parseEther("0.0001"));
  await (await curve.buy(ist.token, cityQuote * 99n / 100n, { value: hre.ethers.parseEther("0.0001") })).wait();
  const expectedClaim = hre.ethers.parseEther("0.000001");
  if ((await curve.claimableCommunityFees(wallet.address)) - claimBeforeCityTrade !== expectedClaim) throw new Error("community accrual mismatch");
  if (await curve.pendingBuybackNative() !== hre.ethers.parseEther("0.000001")) throw new Error("deferred buyback mismatch");
  await (await deployment.setTestRouterEnabled(true)).wait();
  await (await curve.executePendingBuyback(await curve.pendingBuybackNative())).wait();
  if (await curve.pendingBuybackNative() !== 0n) throw new Error("deferred buyback execution failed");
  await (await curve.claimCommunityFees(wallet.address)).wait();
  if (await curve.claimableCommunityFees(wallet.address) !== 0n) throw new Error("community claim failed");

  console.log("Robinhood test deployment passed");
  console.log("Deployment:", await deployment.getAddress());
  console.log("EARTH:", earthAddress);
  console.log("BondingCurve:", curveAddress);
  console.log("PointFactory:", cityFactoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
