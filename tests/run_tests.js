#!/usr/bin/env node

/**
 * Test Runner for Near2Door Frontend Tests
 * Executes all frontend unit and integration tests
 */

const path = require('path');

// Load test modules
const frontendTests = require('./test_frontend.js');
const integrationTests = require('./test_frontend_integration.js');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function printHeader() {
  console.log(`\n${colors.bright}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}Near2Door Frontend Test Suite${colors.reset}`);
  console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}\n`);
}

function printSection(title) {
  console.log(`\n${colors.yellow}${colors.bright}>> ${title}${colors.reset}`);
  console.log(`${colors.yellow}${'─'.repeat(60)}${colors.reset}`);
}

function printSummary(testName, passed) {
  const status = passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`;
  console.log(`${status} ${testName}`);
}

function runTests() {
  printHeader();

  try {
    printSection('Frontend Unit Tests');
    frontendTests.runAllTests();

    printSection('Frontend Integration Tests');
    integrationTests.runAllIntegrationTests();

    console.log(`\n${colors.bright}${colors.green}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.green}ALL TESTS COMPLETED SUCCESSFULLY ✓${colors.reset}`);
    console.log(`${colors.bright}${colors.green}${'='.repeat(60)}${colors.reset}\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}TEST EXECUTION FAILED:${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
