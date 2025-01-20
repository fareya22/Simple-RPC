
const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const SERVER_IP = '10.100.201.94'; 
const PORT = 3000;

const client = new net.Socket();

function connectToServer() {
    console.log(`Attempting to connect to '${SERVER_IP}:${PORT}...`);
    
    client.connect(PORT, SERVER_IP, () => {
        console.log('Connected to server successfully!');
        askForNumber();
    });
}

function askForNumber() {
    rl.question('Enter a number to calculate its factorial: ', (input) => {
        const number = parseInt(input, 10);
        
        if (isNaN(number) || number < 0) {
            console.log('Please enter a valid non-negative integer.');
            askForNumber(); 
        } else {
            const request = {
                method: 'factorial',
                args: [number]
            };
            console.log('Sending request:', request);
            client.write(JSON.stringify(request));
        }
    });
}

client.on('data', (data) => {
    try {
        const response = JSON.parse(data.toString());
        console.log('Received response:', response);
        
        if (response.success) {
            console.log('Factorial result:', response.result);
        } else {
            console.log('Error:', response.error);
        }
        
        
        rl.question('Would you like to calculate another factorial? (yes/no): ', (answer) => {
            if (answer.toLowerCase().startsWith('y')) {
                askForNumber();
            } else {
                console.log('Goodbye!');
                client.end();
                rl.close();
            }
        });
    } catch (error) {
        console.log('Error parsing server response:', error.message);
        client.end();
        rl.close();
    }
});

client.on('error', (error) => {
    console.log('\nConnection error:', error.message);
    console.log('\nPlease check:');
    console.log('1. The server is running');
    console.log('2. You are using the correct local IP address');
    console.log('3. Both computers are on the same network');
    console.log('4. No firewall is blocking the connection');
    rl.close();
});

client.on('close', () => {
    console.log('Connection closed');
    process.exit(0);
});


connectToServer();