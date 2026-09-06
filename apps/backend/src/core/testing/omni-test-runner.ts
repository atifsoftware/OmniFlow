import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { OmniDbService } from "../database/omni-db.service";

type TestCallback = (assert: typeof import("assert")) => Promise<void>;

interface TestCase {
  name: string;
  run: TestCallback;
}

/**
 * OmniFlow Test Runner — DB-sandboxed Testing Framework
 * Inspired by NodeFlow-React testRunner.js
 *
 * All tests run inside a MySQL TRANSACTION that is ROLLED BACK automatically.
 * Your database stays pristine after every test run — no cleanup needed!
 *
 * Usage:
 *   const runner = new OmniTestRunner(db);
 *   runner.test("User can be created", async (assert) => {
 *     const id = await db.table("users").insert({ name: "Test" });
 *     assert.ok(id > 0, "Insert must return a positive ID");
 *   });
 *   const results = await runner.run();
 */
export class OmniTestRunner {
  private readonly tests: TestCase[] = [];
  private readonly results: Array<{ name: string; passed: boolean; error?: string }> = [];

  constructor(private readonly db: OmniDbService) {}

  /**
   * Register a test case
   */
  test(name: string, callback: TestCallback): this {
    this.tests.push({ name, run: callback });
    return this;
  }

  /**
   * Load all .test.ts / .spec.ts files from a directory
   */
  loadDirectory(dir: string): this {
    if (!fs.existsSync(dir)) {
      console.warn(`[OmniTestRunner] Test directory not found: ${dir}`);
      return this;
    }
    const files = fs.readdirSync(dir).filter((f) => f.match(/\.(test|spec)\.(ts|js)$/));
    for (const file of files) {
      require(path.join(dir, file));
    }
    return this;
  }

  /**
   * Run all registered tests
   */
  async run(): Promise<{ passed: number; failed: number; results: typeof this.results }> {
    this._printHeader();

    let passed = 0;
    let failed = 0;

    for (const testCase of this.tests) {
      process.stdout.write(`  ⏳ ${testCase.name} ... `);
      try {
        await this._runInSandbox(testCase.run);
        passed++;
        this.results.push({ name: testCase.name, passed: true });
        console.log("\x1b[32m✓ PASSED\x1b[0m");
      } catch (err: unknown) {
        failed++;
        const errMsg = err instanceof Error ? err.message : String(err);
        this.results.push({ name: testCase.name, passed: false, error: errMsg });
        console.log("\x1b[31m✗ FAILED\x1b[0m");
        console.log(`  \x1b[31m  ${errMsg}\x1b[0m`);
      }
    }

    this._printSummary(passed, failed);
    return { passed, failed, results: this.results };
  }

  /**
   * Run a single test inside a database transaction that is automatically rolled back.
   * This keeps the database pristine regardless of test outcome.
   */
  private async _runInSandbox(callback: TestCallback): Promise<void> {
    let testError: Error | null = null;

    try {
      await this.db.transaction(async (tx) => {
        // Disable FK checks for clean test data
        await tx.query("SET FOREIGN_KEY_CHECKS = 0");

        try {
          await callback(assert);
        } finally {
          await tx.query("SET FOREIGN_KEY_CHECKS = 1");
        }

        // Force rollback to undo all test DB changes
        throw new Error("__OMNI_TEST_SANDBOX_ROLLBACK__");
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "__OMNI_TEST_SANDBOX_ROLLBACK__") {
        // Success — this is the expected rollback
        return;
      }
      testError = err instanceof Error ? err : new Error(String(err));
    }

    if (testError) throw testError;
  }

  private _printHeader(): void {
    console.log("\n\x1b[36m╔═══════════════════════════════════════════════╗\x1b[0m");
    console.log("\x1b[36m║       OMNIFLOW AUTOMATED TEST RUNNER          ║\x1b[0m");
    console.log(`\x1b[36m║       ${this.tests.length} test case(s) registered              ║\x1b[0m`);
    console.log("\x1b[36m╚═══════════════════════════════════════════════╝\x1b[0m\n");
  }

  private _printSummary(passed: number, failed: number): void {
    console.log("\n\x1b[36m─────────────────────────────────────────────────\x1b[0m");
    console.log(
      `  📊 Results:  \x1b[32m${passed} Passed\x1b[0m  |  \x1b[31m${failed} Failed\x1b[0m  |  Total: ${passed + failed}`,
    );
    console.log("\x1b[36m─────────────────────────────────────────────────\x1b[0m\n");
  }
}

/**
 * Global test registry for decorator-based usage
 */
const _globalTestCases: TestCase[] = [];

export function OmniTest(name: string): MethodDecorator {
  return (target, propertyKey) => {
    _globalTestCases.push({
      name,
      run: (target as Record<string | symbol, TestCallback>)[propertyKey],
    });
  };
}

export function getGlobalTests(): TestCase[] {
  return _globalTestCases;
}
