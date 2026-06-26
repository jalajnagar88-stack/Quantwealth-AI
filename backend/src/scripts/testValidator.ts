import { validateLaunchSpec } from '../services/HacdValidator';
import { IHacdLaunchSpec } from '../models/HacdLaunchSpec';
import * as fs from 'fs';
import * as path from 'path';

// Load the example launch_spec.json
const launchSpecPath = path.join(__dirname, '../../../examples/quantwealth_token/launch_spec.json');
const launchSpecJson = JSON.parse(fs.readFileSync(launchSpecPath, 'utf-8'));

// Run validator
const result = validateLaunchSpec(launchSpecJson as IHacdLaunchSpec);

console.log('=== Validator Test Results ===');
console.log(`Passed: ${result.passed}`);
console.log(`\nErrors (${result.errors.length}):`);
result.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
console.log(`\nWarnings (${result.warnings.length}):`);
result.warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));

if (result.passed) {
  console.log('\n✅ Validator passed with no errors!');
} else {
  console.log('\n❌ Validator failed. Fix errors before submission.');
  process.exit(1);
}
