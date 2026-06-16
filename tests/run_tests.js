const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Sovereign Budget Offline Test Suite...\n');

const testFiles = [
    path.join(__dirname, 'encryption.test.js'),
    path.join(__dirname, 'financials.test.js'),
    path.join(__dirname, 'integration.test.js')
];

// Run test modules using native Node.js test runner and coverage flags
const child = spawn('node', ['--experimental-test-coverage', '--test', ...testFiles], { stdio: 'inherit' });

child.on('close', (code) => {
    if (code === 0) {
        console.log('\n✅ All tests passed successfully!');
    } else {
        console.error(`\n❌ Tests failed with exit code: ${code}`);
    }
    process.exit(code);
});
