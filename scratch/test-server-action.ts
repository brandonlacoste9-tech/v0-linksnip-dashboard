import { TrustDelegationEngineServer } from './lib/mrk/trust/TrustDelegationEngineServer';

async function test() {
  console.log("Instantiating engine...");
  const engine = new TrustDelegationEngineServer();
  console.log("Calling getAnonymizedCohortStats()...");
  const stats = await engine.getAnonymizedCohortStats();
  console.log("Stats:", stats);
  
  console.log("Calling mintOriginAnchor()...");
  const anchor = await engine.mintOriginAnchor("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2", "demo-credential-id");
  console.log("Anchor:", anchor);
}

test().catch(console.error);
