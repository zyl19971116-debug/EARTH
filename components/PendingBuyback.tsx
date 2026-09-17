"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, Contract, JsonRpcProvider, formatEther } from "ethers";
import { toast } from "sonner";

const curveAddress = process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS || "";
const chainId = Number(process.env.NEXT_PUBLIC_ROBINHOOD_CHAIN_ID || "4663");
const rpcUrl = process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL || "https://rpc.mainnet.chain.robinhood.com";
const curveAbi = [
  "function pendingBuybackNative() view returns (uint256)",
  "function executePendingBuyback(uint256 amount) returns (uint256)",
];

type InjectedProvider = { request(args: { method: string; params?: unknown[] }): Promise<unknown> };

export default function PendingBuyback() {
  const [pending, setPending] = useState(0n);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    if (!curveAddress) return;
    const provider = new JsonRpcProvider(rpcUrl);
    const amount = await new Contract(curveAddress, curveAbi, provider).pendingBuybackNative() as bigint;
    setPending(amount);
  }

  useEffect(() => {
    if (!curveAddress) return;
    let current = true;
    const provider = new JsonRpcProvider(rpcUrl);
    const curve = new Contract(curveAddress, curveAbi, provider);
    const update = () => {
      (curve.pendingBuybackNative() as Promise<bigint>).then((amount) => {
        if (current) setPending(amount);
      }).catch(() => undefined);
    };
    const timer = window.setInterval(update, 30_000);
    update();
    return () => {
      current = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!curveAddress || pending === 0n) return null;

  async function execute() {
    const injected = (window as unknown as { ethereum?: InjectedProvider }).ethereum;
    if (!injected) return toast.error("Open the site inside an EVM wallet browser.");
    setLoading(true);
    try {
      await injected.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      const signer = await new BrowserProvider(injected).getSigner();
      const curve = new Contract(curveAddress, curveAbi, signer);
      const latest = await curve.pendingBuybackNative() as bigint;
      if (latest === 0n) {
        setPending(0n);
        return toast.success("The pending buyback was already executed.");
      }
      const tx = await curve.executePendingBuyback(latest);
      toast.message("Buyback retry submitted. Waiting for confirmation…");
      await tx.wait();
      await refresh();
      toast.success("Deferred $EARTH buyback executed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Buyback retry failed. Funds remain pending.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pendingbuyback" aria-live="polite">
      <div>
        <small>DEFERRED BUYBACK</small>
        <strong>{formatEther(pending)} ETH waiting to buy $EARTH</strong>
        <p>A previous buyback route failed. The funds are safely held by the contract and can be retried by anyone.</p>
      </div>
      <button className="dark" disabled={loading} onClick={execute}>
        {loading ? "Executing…" : "Execute Buyback"}
      </button>
    </section>
  );
}
