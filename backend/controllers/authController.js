const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const readline = require('readline/promises');

// The URL of your deployed server, now with the correct /api path
const API_URL = 'https://apna-git.onrender.com/api';
const CONFIG_PATH = path.join(os.homedir(), '.apna-git-config.json');

// Helper to read/write the global config file
async function readGlobalConfig() {
    try {
        const configData = await fs.readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(configData);
    } catch (error) {
        return {};
    }
}

async function writeGlobalConfig(data) {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(data, null, 2));
}

// --- Signup Command Logic ---
async function signupUser() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        const email = await rl.question('Enter your email: ');
        const username = await rl.question('Enter your username: ');
        const password = await rl.question('Enter your password: ');

        console.log('Creating account...');
        const response = await axios.post(`${API_URL}/signup`, { email, username, password });

        const config = await readGlobalConfig();
        config.token = response.data.token;
        await writeGlobalConfig(config);

        console.log(`✅ Signup successful! You are now logged in.`);

    } catch (err) {
        console.error('❌ Signup failed:', err.response?.data?.message || err.message);
    } finally {
        rl.close();
    }
}

// --- Login Command Logic ---
async function loginUser() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        const email = await rl.question('Enter your email: ');
        const password = await rl.question('Enter your password: ');

        console.log('Logging in...');
        const response = await axios.post(`${API_URL}/login`, { email, password });

        const config = await readGlobalConfig();
        config.token = response.data.token;
        await writeGlobalConfig(config);

        console.log(`✅ Login successful!`);

    } catch (err) {
        console.error('❌ Login failed:', err.response?.data?.message || err.message);
    } finally {
        rl.close();
    }
}

module.exports = { signupUser, loginUser, readGlobalConfig };
