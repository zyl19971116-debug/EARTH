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

  if (await curve.TRADE_TAX_BPS() !== 200n) throw new Error("tax is not fixed at 2%");
  if (await curve.mainDevWallet() !== wallet.address) throw new Error("community wallet mismatch");
  if (await earth.balanceOf(wallet.address) !== hre.ethers.parseEther("100000000")) throw new Error("treasury allocation mismatch");

  const quote = await curve.getBuyPrice(earthAddress, hre.ethers.parseEther("0.0001"));
  await (await curve.buy(earthAddress, quote * 99n / 100n, { value: hre.ethers.parseEther("0.0001") })).wait();
  if (await earth.balanceOf(wallet.address) <= hre.ethers.parseEther("100000000")) throw new Error("buy failed");

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
