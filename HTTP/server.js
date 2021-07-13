// 先写一个服务端简易的程序，用来接收我们自己基于 net 实现的 http

const http = require('http');

const server = http.createServer((request, response) => {
	let body = [];

	const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <style>
                .root {
                    width: 100%;
                    min-height: 300px;
                }
            </style>
            <title>browser test</title>
        </head>
        <body>
            <div class="root">
                <div class="child-1">child-1</div>
                <div class="child-2">child-2</div>
                <div class="child-3">child-3</div>
            </div>
        </body>
    </html>
    
    `;

	request
		.on('error', e => {
			console.log(e);
		})
		.on('data', chunk => {
			// chunk 初始为 二进制数据  buf.toString('utf8') 转化为字符串
			body.push(chunk.toString());
			console.log('onData event', body);
		})
		.on('end', () => {
			console.log('onEnd event', body);
			response.writeHead(200, { 'Content-Type': 'text/html' });
			response.end(htmlContent);
		});
});

server.listen(8080);

server
	.on('connection', callbackData => {
		console.log('something is connected', typeof callbackData);
	})
	.on('error', err => {
		console.log('error ocurred', err);
	});

console.log('server started');
