#!/usr/bin/env node

/**
 * Test script to verify Appwrite integration
 * Run: node test-appwrite.js
 */

import appwriteService from './config/appwrite.js';
import appwriteStorage from './utils/appwriteStorage.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🧪 Testing Appwrite Integration\n');
console.log('='.repeat(50));

// Test 1: Check environment variables
console.log('\n1. Environment Variables:');
console.log('   APPWRITE_ENDPOINT:', process.env.APPWRITE_ENDPOINT ? '✅ Set' : '❌ Not set');
console.log('   APPWRITE_PROJECT_ID:', process.env.APPWRITE_PROJECT_ID ? '✅ Set' : '❌ Not set');
console.log('   APPWRITE_API_KEY:', process.env.APPWRITE_API_KEY ? '✅ Set (hidden)' : '❌ Not set');
console.log('   APPWRITE_BUCKET_ID:', process.env.APPWRITE_BUCKET_ID ? '✅ Set' : '⚠️  Not set (storage disabled)');

// Test 2: Initialize Appwrite
console.log('\n2. Initializing Appwrite Client:');
const initialized = appwriteService.initialize();
console.log('   Initialization:', initialized ? '✅ Success' : '⚠️  Skipped (not configured)');

// Test 3: Check services
console.log('\n3. Service Availability:');
if (initialized) {
  try {
    const databases = appwriteService.getDatabases();
    console.log('   Databases: ✅ Available');
  } catch (error) {
    console.log('   Databases: ❌ Error -', error.message);
  }
  
  try {
    const storage = appwriteService.getStorage();
    console.log('   Storage: ✅ Available');
  } catch (error) {
    console.log('   Storage: ❌ Error -', error.message);
  }
  
  try {
    const users = appwriteService.getUsers();
    console.log('   Users: ✅ Available');
  } catch (error) {
    console.log('   Users: ❌ Error -', error.message);
  }
} else {
  console.log('   Services: ⚠️  Not available (Appwrite not configured)');
}

// Test 4: Storage availability
console.log('\n4. Storage Configuration:');
const storageAvailable = appwriteStorage.isAvailable();
console.log('   Storage Ready:', storageAvailable ? '✅ Yes' : '⚠️  No (bucket not configured)');

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:');
if (initialized && storageAvailable) {
  console.log('   ✅ Appwrite is fully configured and ready!');
  console.log('   📁 File uploads will use Appwrite Storage');
} else if (initialized) {
  console.log('   ⚠️  Appwrite client is configured but storage is not');
  console.log('   💡 Set APPWRITE_BUCKET_ID to enable storage');
  console.log('   📁 File uploads will use GridFS');
} else {
  console.log('   ℹ️  Appwrite is not configured');
  console.log('   📁 File uploads will use GridFS (MongoDB)');
  console.log('   💡 To enable Appwrite, set environment variables in .env');
}

console.log('\n✨ Test complete!\n');
