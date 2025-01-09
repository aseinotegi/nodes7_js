// main.js
const PLC_INSTANCE = require('./Adquisicion/PLCx');
const { startExpressServer } = require('./express');

async function run() {
    try {
        await startExpressServer();
        console.log('Express server started, waiting for form data...');

        // Form data processing and PLC logic should be handled in configure.js
        // The main.js file should primarily focus on starting the server
    } catch (error) {
        console.error('Error during execution:', error);
    }
}

run();
