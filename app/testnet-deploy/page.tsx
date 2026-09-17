"use client";

import { useState } from "react";
import Link from "next/link";
import { BrowserProvider, ContractFactory, formatEther, parseEther } from "ethers";
import deploymentArtifact from "../../artifacts/contracts/RobinhoodTestDeployment.sol/RobinhoodTestDeployment.json";

type InjectedProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

const chain = {
  chainId: "0xb626",
  chainName: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Test Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.testnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://explorer.testnet.chain.robinhood.com"],
};

export default function TestnetDeploy() {
  const [status, setStatus] = useState("Connect the funded wallet to begin."),
    [account, setAccount] = useState(""),
    [deployment, setDeployment] = useState(""),
    [busy, setBusy] = useState(false);

  async function connect() {
    const injected = (window as unknown as { ethereum?: InjectedProvider }).ethereum;
    if (!injected) throw new Error("Open this page inside a wallet browser or a browser with an EVM wallet extension.");
    try {
      await injected.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.chainId }] });
    } catch (error) {
      if ((error as { code?: number }).code !== 4902) throw error;
      await injected.request({ method: "wallet_addEthereumChain", params: [chain] });
    }
    const accounts = await injected.request({ method: "eth_requestAccounts" }) as string[];
    if (!accounts[0]) throw new Error("No wallet account returned.");
    setAccount(accounts[0]);
    setStatus("Wallet connected. Review the testnet warning before deploying.");
    return accounts[0];
  }

  async function deploy() {
    setBusy(true);
    try {
      const selected = account || await connect();
      const injected = (window as unknown as { ethereum?: InjectedProvider }).ethereum;
      if (!injected) throw new Error("Wallet provider unavailable.");
      const provider = new BrowserProvider(injected);
      const network = await provider.getNetwork();
      if (network.chainId !== 46630n) throw new Error("Wallet is not on Robinhood Chain Testnet.");
      const balance = await provider.getBalance(selected);
      if (balance < parseEther("0.003")) throw new Error(`At least 0.003 test ETH is recommended. Current balance: ${formatEther(balance)} ETH`);
      setStatus("Confirm the single TESTNET deployment transaction in your wallet.");
      const signer = await provider.getSigner();
      const factory = new ContractFactory(deploymentArtifact.abi, deploymentArtifact.bytecode, signer);
      const contract = await factory.deploy(selected, { value: parseEther("0.001") });
      setStatus("Transaction submitted. Waiting for testnet confirmation…");
      await contract.waitForDeployment();
      const address = await contract.getAddress();
      setDeployment(address);
      setStatus("Test system deployed successfully on Robinhood Chain Testnet.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Deployment failed or was rejected.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "60px auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <Link href="/" style={{ color: "#0b6b4b" }}>← EARTH ONLINE</Link>
      <p style={{ marginTop: 42, color: "#14a36d", fontWeight: 800 }}>ROBINHOOD CHAIN TESTNET</p>
      <h1 style={{ fontSize: 44, margin: "10px 0" }}>Deploy the EARTH test system</h1>
      <p>This deploys the test-only $EARTH token, fixed-rate mock buyback router, 2% tax bonding curve and city factory in one wallet transaction.</p>
      <div style={{ padding: 20, margin: "24px 0", border: "1px solid #e1b64b", borderRadius: 16, background: "#fff9e8" }}>
        <b>Testnet only</b>
        <p style={{ marginBottom: 0 }}>The deployment contract rejects every chain except Chain ID 46630. Test tokens have no value. The mock router must never be used on mainnet.</p>
      </div>
      <div style={{ padding: 20, border: "1px solid #d8dfdc", borderRadius: 16 }}>
        <p><b>Wallet:</b> {account || "Not connected"}</p>
        <p><b>Status:</b> {status}</p>
        {deployment && <p><b>Deployment:</b> <a href={`https://explorer.testnet.chain.robinhood.com/address/${deployment}`} target="_blank" rel="noreferrer">{deployment}</a></p>}
        <button disabled={busy} onClick={deploy} style={{ border: 0, borderRadius: 12, padding: "15px 22px", background: "#0c241c", color: "white", fontWeight: 800, cursor: "pointer" }}>
          {busy ? "Waiting for wallet…" : account ? "Deploy Test Contracts" : "Connect Wallet & Deploy"}
        </button>
      </div>
    </main>
  );
}
