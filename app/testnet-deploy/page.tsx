"use client";

import { useState } from "react";
import Link from "next/link";
import { BrowserProvider, Contract, ContractFactory, formatEther, keccak256, parseEther, toUtf8Bytes } from "ethers";
import deploymentArtifact from "../../artifacts/contracts/RobinhoodTestDeployment.sol/RobinhoodTestDeployment.json";
import factoryArtifact from "../../artifacts/contracts/PointFactory.sol/PointFactory.json";
import curveArtifact from "../../artifacts/contracts/BondingCurve.sol/BondingCurve.json";
import tokenArtifact from "../../artifacts/contracts/PointToken.sol/PointToken.json";

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
const activeTestDeployment = "0xf8F587be20c6fBB6Fb79Dc0866EC779f440E3c9f";
const activePointFactory = "0x61F35B81333792ACa98a92a0207B622E2DC43d2F";
const activeBondingCurve = "0x9D415D244434Dda6fd8fFcb8406BB42c8A2a075e";
const istToken = "0xB0c9c89b428Ee59E206Ea3CAab6d37304774E9FA";

export default function TestnetDeploy() {
  const [status, setStatus] = useState("Connect the funded wallet to begin."),
    [account, setAccount] = useState(""),
    [deployment, setDeployment] = useState(""),
    [cityToken, setCityToken] = useState(""),
    [istBalance, setIstBalance] = useState(""),
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

  async function tradingContracts() {
    const selected = account || await connect();
    const injected = (window as unknown as { ethereum?: InjectedProvider }).ethereum;
    if (!injected) throw new Error("Wallet provider unavailable.");
    const provider = new BrowserProvider(injected);
    if ((await provider.getNetwork()).chainId !== BigInt(46630)) throw new Error("Wallet is not on Robinhood Chain Testnet.");
    const signer = await provider.getSigner();
    return {
      selected,
      curve: new Contract(activeBondingCurve, curveArtifact.abi, signer),
      token: new Contract(istToken, tokenArtifact.abi, signer),
    };
  }

  async function refreshIstBalance() {
    const { selected, token } = await tradingContracts();
    const balance = await token.balanceOf(selected);
    setIstBalance(formatEther(balance));
    return balance as bigint;
  }

  async function buyIst() {
    setBusy(true);
    try {
      const { selected, curve, token } = await tradingContracts();
      const value = parseEther("0.00002");
      const quote = await curve.getBuyPrice(istToken, value) as bigint;
      setStatus("Confirm the $IST TESTNET buy in your wallet.");
      const tx = await curve.buy(istToken, quote * BigInt(99) / BigInt(100), { value });
      setStatus("Buy submitted. Waiting for testnet confirmation…");
      await tx.wait();
      setIstBalance(formatEther(await token.balanceOf(selected)));
      setStatus("$IST buy succeeded. The 2% tax distribution was emitted onchain.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Buy failed or was rejected.");
    } finally {
      setBusy(false);
    }
  }

  async function sellIst() {
    setBusy(true);
    try {
      const { selected, curve, token } = await tradingContracts();
      const balance = await token.balanceOf(selected) as bigint;
      if (balance === BigInt(0)) throw new Error("Buy $IST before testing a sell.");
      setStatus("First confirm the $IST approval in your wallet.");
      await (await token.approve(activeBondingCurve, balance)).wait();
      const quote = await curve.getSellPrice(istToken, balance) as bigint;
      setStatus("Approval confirmed. Now confirm the $IST sell transaction.");
      await (await curve.sell(istToken, balance, quote * BigInt(99) / BigInt(100))).wait();
      setIstBalance(formatEther(await token.balanceOf(selected)));
      setStatus("$IST sell succeeded. The 2% tax distribution was emitted onchain.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sell failed or was rejected.");
    } finally {
      setBusy(false);
    }
  }

  async function launchFirstCity() {
    setBusy(true);
    try {
      const selected = account || await connect();
      const injected = (window as unknown as { ethereum?: InjectedProvider }).ethereum;
      if (!injected) throw new Error("Wallet provider unavailable.");
      const provider = new BrowserProvider(injected);
      if ((await provider.getNetwork()).chainId !== BigInt(46630)) throw new Error("Wallet is not on Robinhood Chain Testnet.");
      const signer = await provider.getSigner();
      if ((await signer.getAddress()).toLowerCase() !== selected.toLowerCase()) throw new Error("Connected account changed. Reconnect and try again.");
      const factory = new Contract(activePointFactory, factoryArtifact.abi, signer);
      const cityKey = keccak256(toUtf8Bytes("IST"));
      const city = await factory.getCity(cityKey);
      if (city.launched) {
        setCityToken(city.token);
        setStatus("Istanbul is already launched on this test deployment.");
        return;
      }
      setStatus("Confirm the Istanbul TESTNET launch transaction in your wallet.");
      const tx = await factory.launchCityToken(
        cityKey,
        "/cities/istanbul.png",
        "EARTH ONLINE first Robinhood testnet city",
        { value: parseEther("0.0001") },
      );
      setStatus("City launch submitted. Waiting for testnet confirmation…");
      await tx.wait();
      const launchedCity = await factory.getCity(cityKey);
      setCityToken(launchedCity.token);
      setStatus("Istanbul city token launched successfully on testnet.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "City launch failed or was rejected.");
    } finally {
      setBusy(false);
    }
  }

  async function deploy() {
    setBusy(true);
    try {
      const selected = account || await connect();
      const injected = (window as unknown as { ethereum?: InjectedProvider }).ethereum;
      if (!injected) throw new Error("Wallet provider unavailable.");
      const provider = new BrowserProvider(injected);
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(46630)) throw new Error("Wallet is not on Robinhood Chain Testnet.");
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
      <div style={{ padding: 20, marginTop: 20, border: "1px solid #d8dfdc", borderRadius: 16 }}>
        <h2>Test the first city launch</h2>
        <p><b>City:</b> Istanbul · $IST</p>
        <p><b>Factory:</b> {activePointFactory}</p>
        <p><b>Initial city seed:</b> 0.0001 test ETH</p>
        <p><b>Active deployment:</b> {activeTestDeployment}</p>
        {cityToken && <p><b>City token:</b> <a href={`https://explorer.testnet.chain.robinhood.com/address/${cityToken}`} target="_blank" rel="noreferrer">{cityToken}</a></p>}
        <button disabled={busy} onClick={launchFirstCity} style={{ border: 0, borderRadius: 12, padding: "15px 22px", background: "#14a36d", color: "white", fontWeight: 800, cursor: "pointer" }}>
          {busy ? "Waiting for wallet…" : "Launch Istanbul Test Token"}
        </button>
      </div>
      <div style={{ padding: 20, marginTop: 20, border: "1px solid #d8dfdc", borderRadius: 16 }}>
        <h2>Test $IST trading and fixed tax</h2>
        <p><b>Trade:</b> 0.00002 test ETH → $IST</p>
        <p><b>Tax:</b> 2% fixed · 50% EARTH buyback · 30% city community · 20% main community</p>
        <p><b>Your IST balance:</b> {istBalance || "Click refresh"}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button disabled={busy} onClick={refreshIstBalance} style={{ border: "1px solid #0c241c", borderRadius: 12, padding: "14px 18px", background: "white", color: "#0c241c", fontWeight: 800 }}>Refresh Balance</button>
          <button disabled={busy} onClick={buyIst} style={{ border: 0, borderRadius: 12, padding: "14px 18px", background: "#14a36d", color: "white", fontWeight: 800 }}>Buy $IST</button>
          <button disabled={busy} onClick={sellIst} style={{ border: 0, borderRadius: 12, padding: "14px 18px", background: "#0c241c", color: "white", fontWeight: 800 }}>Approve & Sell All $IST</button>
        </div>
      </div>
    </main>
  );
}
