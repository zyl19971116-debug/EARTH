"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, Contract, JsonRpcProvider, formatEther } from "ethers";
import { toast } from "sonner";

const factoryAddress = process.env.NEXT_PUBLIC_POINT_FACTORY_ADDRESS || "";
const curveAddress = process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS || "";
const chainId = Number(process.env.NEXT_PUBLIC_ROBINHOOD_CHAIN_ID || "4663");
const rpcUrl = process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL || "https://rpc.mainnet.chain.robinhood.com";

const factoryAbi = [
  "function getAllCities() view returns (tuple(string name,string symbol,string region,string landmark,uint8 populationRank,bool launched,address token,address creator,address communityWallet,uint64 launchedAt)[])",
];
const curveAbi = [
  "function claimableCommunityFees(address wallet) view returns (uint256)",
  "function claimCommunityFees(address payable recipient) returns (uint256)",
];

type InjectedProvider = { request(args: { method: string; params?: unknown[] }): Promise<unknown> };
type City = { name: string; symbol: string; launched: boolean; creator: string };

export default function CommunityFeeClaim({ account }: { account: string }) {
  const [cities, setCities] = useState<City[]>([]),
    [claimable, setClaimable] = useState(BigInt(0)),
    [loading, setLoading] = useState(false);

  async function refresh() {
    if (!account || !factoryAddress || !curveAddress) return;
    const provider = new JsonRpcProvider(rpcUrl);
    const factory = new Contract(factoryAddress, factoryAbi, provider);
    const curve = new Contract(curveAddress, curveAbi, provider);
    const allCities = await factory.getAllCities() as City[];
    setCities(allCities.filter((city) => city.launched && city.creator.toLowerCase() === account.toLowerCase()));
    setClaimable(await curve.claimableCommunityFees(account) as bigint);
  }

  useEffect(() => {
    let current = true;
    if (!account || !factoryAddress || !curveAddress) return;
    const provider = new JsonRpcProvider(rpcUrl);
    Promise.all([
      new Contract(factoryAddress, factoryAbi, provider).getAllCities() as Promise<City[]>,
      new Contract(curveAddress, curveAbi, provider).claimableCommunityFees(account) as Promise<bigint>,
    ]).then(([allCities, amount]) => {
      if (!current) return;
      setCities(allCities.filter((city) => city.launched && city.creator.toLowerCase() === account.toLowerCase()));
      setClaimable(amount);
    }).catch(() => undefined);
    return () => { current = false; };
  }, [account]);

  if (!account || !factoryAddress || !curveAddress || !cities.length) return null;

  async function claim() {
    const injected = (window as unknown as { ethereum?: InjectedProvider }).ethereum;
    if (!injected) return toast.error("Open the site inside an EVM wallet browser.");
    setLoading(true);
    try {
      const expectedHex = `0x${chainId.toString(16)}`;
      await injected.request({ method: "wallet_switchEthereumChain", params: [{ chainId: expectedHex }] });
      const provider = new BrowserProvider(injected);
      const signer = await provider.getSigner();
      if ((await signer.getAddress()).toLowerCase() !== account.toLowerCase()) throw new Error("Connected wallet changed.");
      const curve = new Contract(curveAddress, curveAbi, signer);
      const tx = await curve.claimCommunityFees(account);
      toast.message("Claim submitted. Waiting for confirmation…");
      await tx.wait();
      await refresh();
      toast.success("Community fees claimed successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Claim failed or was rejected.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ marginTop: 24, padding: 24, border: "1px solid #d8dfdc", borderRadius: 18, background: "white" }}>
      <small style={{ color: "#14a36d", fontWeight: 800 }}>CITY CREATOR FEES</small>
      <h2>Claim community fees</h2>
      <p>Creator of {cities.map((city) => `$${city.symbol}`).join(", ")}</p>
      <p><b>{formatEther(claimable)} ETH</b> available to claim</p>
      <button className="dark" disabled={loading || claimable === BigInt(0)} onClick={claim}>
        {loading ? "Claiming…" : claimable === BigInt(0) ? "Nothing to Claim" : "Claim Fees"}
      </button>
    </section>
  );
}
