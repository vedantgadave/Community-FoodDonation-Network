import { runSingleNgoConcurrencyTest } from './concurrency.test';

async function main() {
  try {
    await runSingleNgoConcurrencyTest();
    console.log('\n[SUCCESS] Single-NGO Atomic Concurrency Test passed with 100% compliance!');
    process.exit(0);
  } catch (error) {
    console.error('\n[FAILED] Concurrency Test Failed:', error);
    process.exit(1);
  }
}

main();
