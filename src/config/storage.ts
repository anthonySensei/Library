import { Storage } from '@google-cloud/storage';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';

import { getStorageKeyFilePath } from '../helper/path';

config();

const { STORAGE_PROJECT_ID, STORAGE_PRIVATE_KEY_ID, STORAGE_CLIENT_EMAIL, STORAGE_CLIENT_ID } = process.env;
const { STORAGE_CLIENT_X509_CERT_URL, STORAGE_PRIVATE_KEY } = process.env;

const credentials = {
    type: 'service_account',
    project_id: STORAGE_PROJECT_ID,
    private_key_id: STORAGE_PRIVATE_KEY_ID,
    private_key: STORAGE_PRIVATE_KEY,
    client_email: STORAGE_CLIENT_EMAIL,
    client_id: STORAGE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: STORAGE_CLIENT_X509_CERT_URL
};

writeFileSync(getStorageKeyFilePath(), JSON.stringify(credentials));

const storage = new Storage({
    keyFilename: getStorageKeyFilePath(),
    projectId: STORAGE_PROJECT_ID
});

export default storage.bucket(process.env.STORAGE_BUCKET_NAME as string);
