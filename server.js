
const net = require('net');

const methods = {
    factorial: (num) => {
        num = Number(num);
        
        if (!Number.isInteger(num)) {
            return "Invalid input: Please provide an integer";
        }
        if (num < 0) {
            return "Invalid input: Factorial of negative numbers is undefined";
        }
        if (num > 170) {
            return "Invalid input: Number too large, will cause overflow";
        }
        
        let result = 1;
        for(let i = 2; i <= num; i++) {
            result *= i;
        }
        return result;
    }
};

const server = net.createServer((socket) => {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`Client connected from ${clientAddress}`);

    socket.on('data', (data) => {
        try {
            const request = JSON.parse(data.toString());
            const { method, args } = request;
            console.log('Received request:', request);
            if (!method || !Array.isArray(args)) {
                throw new Error("Invalid request format");
            }
            if (methods[method]) {
                const result = methods[method](...args);
                const response = {
                    success: true,
                    result: result
                };
                console.log('Sending response:', response);
                socket.write(JSON.stringify(response));
            } else {
                socket.write(JSON.stringify({
                    success: false,
                    error: `Method '${method}' not found`
                }));
            }
        } catch (err) {
            console.error('Error processing request:', err);
            socket.write(JSON.stringify({
                success: false,
                error: err.message || "Invalid request format"
            }));
        }
    });

    socket.on('end', () => {
        console.log(`Client disconnected: ${clientAddress}`);
    });

    socket.on('error', (err) => {
        console.error(`Socket error for ${clientAddress}:, err.message`);
    });
});

const PORT = 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
    console.log('Available methods:', Object.keys(methods));
});

server.on('error', (err) => {
    console.error('Server error:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    }
});