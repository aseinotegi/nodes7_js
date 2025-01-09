// configure.js
const express = require('express');
const router = express.Router();

router.post('/configure', (req, res) => {
    const { ip, rack, slot, db, bools, bytes, int16, int32, float } = req.body;

    // Add your logic to handle and save the form data
    console.log(`Received configuration: IP=${ip}, Rack=${rack}, Slot=${slot}, DB=${db}, Bools=${bools}, Bytes=${bytes}, Int16=${int16}, Int32=${int32}, Float=${float}`);

    // If you need to start PLC_INSTANCE logic after receiving form data, do it here
    const PLC_INSTANCE = require('./Adquisicion/PLCx');
    const PLC1 = new PLC_INSTANCE(ip, rack, slot, db, bools, bytes, int16, int32, float, 'mqtt://localhost', 'datos_plc');
    PLC1.defineVariables();
    PLC1.connectToPLC();
    setInterval(() => PLC1.ReadDataChange(), 30);

    // Redirect to success page
    res.redirect('/success');
});

module.exports = router;
