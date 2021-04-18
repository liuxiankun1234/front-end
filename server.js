const http = require('http');

http.createServer((request, response) => {
    let body = [];

    request.on('error', (err) => {
        console.error(err)
    }).on('data', (chunk) => {
        console.log('chunk', chunk.toString())
        body.push(chunk.toString())
    }).on('end', () => {
        console.log(2222)
        // body = Buffer.concat(body).toString();
        // console.log('body', body)
        response.writeHead(200, {
            'Content-type': 'text/html'
        })
        response.end('hello word\n')
    })
}).listen(3000)