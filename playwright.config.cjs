const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
    testDir: './tests/web',
    timeout: 60000,
    workers: 1,
    retries: 0,
    use: { baseURL: 'http://127.0.0.1:8081', viewport: {width:390,height:844}, trace:'retain-on-failure', screenshot:'only-on-failure', launchOptions: process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {} },
    webServer: { command: 'npm run preview:web', url: 'http://127.0.0.1:8081', reuseExistingServer: !process.env.CI },
});
