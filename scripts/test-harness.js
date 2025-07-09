#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running comprehensive test harness...\n');

const runCommand = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
};

async function runTests() {
  try {
    console.log('📝 Running TypeScript type checking...');
    await runCommand('npm', ['run', 'typecheck']);
    console.log('✅ TypeScript type checking passed\n');

    console.log('🧹 Running linting...');
    await runCommand('npm', ['run', 'lint']);
    console.log('✅ Linting passed\n');

    console.log('🃏 Running Jest tests with coverage...');
    await runCommand('npm', ['run', 'test:coverage']);
    console.log('✅ All tests passed\n');

    console.log('🏗️  Testing build process...');
    await runCommand('npm', ['run', 'build']);
    console.log('✅ Build completed successfully\n');

    console.log('🎉 All tests passed! Your code is ready for deployment.');
    
  } catch (error) {
    console.error('\n❌ Test harness failed:', error.message);
    console.error('\n🔧 Please fix the issues above before proceeding.');
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isQuick = args.includes('--quick');
const isCoverage = args.includes('--coverage');

if (isQuick) {
  console.log('⚡ Running quick tests (no build)...\n');
  runTests().catch(() => process.exit(1));
} else if (isCoverage) {
  console.log('📊 Running coverage report only...\n');
  runCommand('npm', ['run', 'test:coverage']).catch(() => process.exit(1));
} else {
  runTests();
}

module.exports = { runCommand, runTests };