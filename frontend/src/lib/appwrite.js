import { Client, Account} from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68ef61ed0005c49591cf'); // Replace with your project ID

export const account = new Account(client);
export { ID } from 'appwrite';

import { Databases, Storage } from 'appwrite';

