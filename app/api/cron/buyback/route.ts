import { Contract, JsonRpcProvider, Wallet } from "ethers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const curveAbi = [
  "function pendingBuybackNative() view returns (uint256)",
  "function executePendingBuyback(uint256 amount) returns (uint256)",
];

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const rpcUrl = process.env.ROBINHOOD_RPC_URL || process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL;
  const curveAddress = process.env.BONDING_CURVE_ADDRESS || process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS;
  const keeperKey = process.env.BUYBACK_KEEPER_PRIVATE_KEY;
  if (!rpcUrl || !curveAddress || !keeperKey) {
    return Response.json({ ok: true, skipped: "keeper not configured" });
  }

  try {
    const provider = new JsonRpcProvider(rpcUrl);
    const keeper = new Wallet(keeperKey, provider);
    const curve = new Contract(curveAddress, curveAbi, keeper);
    const pending = await curve.pendingBuybackNative() as bigint;
    if (pending === BigInt(0)) {
      return Response.json({ ok: true, skipped: "no pending buyback" });
    }

    const tx = await curve.executePendingBuyback(pending);
    const receipt = await tx.wait();
    return Response.json({
      ok: true,
      amount: pending.toString(),
      transactionHash: receipt.hash,
    });
  } catch (error) {
    // The contract keeps the pending amount when the retry transaction reverts.
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "buyback retry failed" },
      { status: 500 },
    );
  }
}
