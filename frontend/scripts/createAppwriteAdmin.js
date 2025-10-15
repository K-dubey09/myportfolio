// Script to create admin account in Appwrite
import { Client, Account, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68ef61ed0005c49591cf');

const account = new Account(client);

async function createAdminAccount() {
    try {
        console.log('Creating admin account in Appwrite...');
        
        // Create account
        const user = await account.create(
            ID.unique(),
            'kushagradubey5002@gmail.com',
            'Dubey@5002',
            'Admin'
        );
        
        console.log('✅ Admin account created successfully!');
        console.log('User ID:', user.$id);
        console.log('Email:', user.email);
        console.log('Name:', user.name);
        console.log('\nYou can now login with:');
        console.log('Email: kushagradubey5002@gmail.com');
        console.log('Password: Dubey@5002');
        
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  Admin account already exists!');
            console.log('You can login with:');
            console.log('Email: kushagradubey5002@gmail.com');
            console.log('Password: Dubey@5002');
        } else {
            console.error('❌ Error creating admin account:', error.message);
            console.error('Full error:', error);
        }
    }
    
    process.exit(0);
}

createAdminAccount();
