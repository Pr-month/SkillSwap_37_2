import { config } from 'dotenv';
import { resolve } from 'path';

const envFile = resolve(__dirname, '..', '.env.test.local');
config({ path: envFile });
