import artifact from "../../../artifacts/contracts/RobinhoodMainnetDeployment.sol/RobinhoodMainnetDeployment.json";

export async function GET() {
  return Response.json({ abi: artifact.abi, bytecode: artifact.bytecode });
}
