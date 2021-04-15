// 先写一个服务端简易的程序，用来接收我们自己基于 net 实现的 http

const http = require('http');

const server = http.createServer((request, response) => {
    let body = [];

    request
        .on('error', (e) => {
            console.log(e);
        })
        .on('data', (chunk) => {

            body.push(chunk.toString());
            console.log('onData event', body);
        })
        .on('end', () => {
            console.log('end event')
            // body = Buffer.concat(body).toString();
            // console.log(body);
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end('Hello toy-broswer');
        });

})

server.listen(8080)

server.on('connection', (callbackData) => {
    console.log('something is connected', typeof callbackData)
}).on('error', (err) => {
    console.log('error ocurred', err)
})

console.log('server started')

