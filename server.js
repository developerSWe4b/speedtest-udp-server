const dgram = require('dgram');

const now = require('performance-now');

const PORT = 3000;

const PACKET_SIZE = 1024;

const NUM_PACKETS = 1000;

const server = dgram.createSocket('udp4');

server.on('error', (err) => {

  console.log(`server error:\n${err.stack}`);

  server.close();

});

server.on('listening', () => {

  const address = server.address();

  console.log(`server listening ${address.address}:${address.port}`);

});

server.on('message', (msg, rinfo) => {

  console.log(`server got: ${msg.length} bytes from ${rinfo.address}:${rinfo.port}`);

  // Run the speed test

  const start = now();

  for (let i = 0; i < NUM_PACKETS; i++) {

    const data = Buffer.alloc(PACKET_SIZE);

    server.send(data, 0, data.length, rinfo.port, rinfo.address);

  }

  const end = now();

  const elapsedMs = end - start;

  const speedMbps = (PACKET_SIZE * NUM_PACKETS * 8) / (elapsedMs / 1000) / 1000000;

  console.log(`Speed test result: ${speedMbps.toFixed(2)} Mbps`);

  // Send the speed test result back to the client

  const result = { speedMbps };

  const resultJson = JSON.stringify(result);

  server.send(resultJson, 0, resultJson.length, rinfo.port, rinfo.address, () => {

    // Close the socket once the result has been sent

    server.close();

  });

});

server.bind(PORT);

