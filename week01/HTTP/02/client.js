const net = require('net')

/**
 * 设计一个 http 请求类
 * 
 * 1. Content-Type 是一个必要的请求头，要有默认值
 * 2. 不同的 Content-Type 会决定 bodyText 的格式
 * 3. body 就是 key-value 的格式
 */
class Request {
    constructor(options = {}) {

        const {
            method = 'GET',
            headers = {},
            host,
            port = '80',
            path = '/',
            body
        } = options;

        this.method = method;
        this.headers = headers;
        this.host = host;
        this.port = port;
        this.path = path;
        this.body = body;
        this.bodyText = '';

        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body)
        }

        if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }

        this.headers['Content-Length'] = this.bodyText.length;
    }

    toString() {
        // http 请求报文 请求行、请求header、请求体

        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}`
    }

    send(connection) {
        return new Promise((resolve, reject) => {
            // let responseParser = new ResonseParser();

            if (connection) {
                connection.write(this.toString())
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    console.log('tcp connection connected!')
                    console.log(this.toString())
                    connection.write(this.toString())

                });
            }

            let responseArr = []
            setTimeout(() => {
                resolve(responseArr)
                connection.end();
            }, 1000)

            connection.on('data', (dataChunk) => {
                responseArr.push(dataChunk.toString())

                console.log('========net on data======')
                console.log(dataChunk)
                console.log(dataChunk.toString())
                // responseParser.receive(dataChunk.toString())

                // if (responseParser.isFinished) {
                //     resolve(responseParser.response)
                //     connection.end();
                // }
            }).on('error', (e) => {
                reject(e);
                connection.end();
            })

        })

    }
}


class ResonseParser {

    constructor() {
        this.isFinished = false;
    }

    receive(data) {


    }
}

async function test() {

    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: '8080',
        path: '/',
        headers: {
            ["X-foo"]: 'customed'
        },
        body: {
            name: 'stanny'
        }
    })

    let response = await request.send();

    console.log('the response is:\n')
    console.log(response.join())

}


test()