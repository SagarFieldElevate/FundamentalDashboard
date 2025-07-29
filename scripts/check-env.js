#!/usr/bin/env node

// Environment validation script
const requiredEnvVars = ['REACT_APP_DUNE_API_KEY'];

console.log('🔍 Checking environment variables...\n');

let hasErrors = false;

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set (${process.env[varName].substring(0, 6)}...)`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.log('\n❌ Environment validation failed!');
  console.log('Please set all required environment variables.');
  console.log('See .env.example for reference.');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are set!');
  process.exit(0);
}