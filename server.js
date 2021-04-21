import http from 'http'
import fs from 'fs'
import path from 'path'

// const net = require('net');


// const server = net.createServer(function(connection) {
//     console.log('client connected')
//     connection.on('end', () => {
//         console.log('client close server')
//     })

//     const file = fs.readFileSync('./test.html');
//     connection.write(file)
//     connection.pipe(connection)
// })
// server.listen('3000', () => {
//     console.log('server is listening on 3000');
// })

http.createServer((request, response) => {
    let body = [];

    request.on('error', (err) => {
        console.error(err)
    }).on('data', (chunk) => {
        console.log('chunk', chunk.toString())
        body.push(chunk.toString())
    }).on('end', () => {
        // body = Buffer.concat(body).toString();
        // console.log('body', body)
        response.writeHead(200, {
            'Content-type': 'text/html'
        })
        

        const file = fs.readFileSync('./test.html');
        response.end(file.toString())
    })
}).listen(3000)