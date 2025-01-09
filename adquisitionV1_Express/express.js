// express.js
const express = require('express');
const bodyParser = require('body-parser');
const configureRouter = require('./configure.js');

const app = express();
const port = 3000;

// Serve static files from the Templates directory
app.use(express.static('Templates'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', configureRouter);

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Templates/index.html');
});

// Serve the success.html file for the /success URL
app.get('/success', (req, res) => {
    res.sendFile(__dirname + '/Templates/success.html');
});

function startExpressServer() {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}/`);
            resolve();
        }).on('error', (err) => {
            console.error('Failed to start server:', err);
            reject(err);
        });
    });
}

module.exports = { startExpressServer };


