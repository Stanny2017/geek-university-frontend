const net = require('net')

/**
 * 设计一个 http 请求类
 * 
 * 1. Content-Type 是一个必要的请求头 默认为表单类型，要有默认值
 * 2. 不同的 Content-Type 对应不同的 bodyText 的格式
 * 3. body 传参就是 key-value 的格式
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
            let responseParser = new ResonseParser();

            if (connection) {
                connection.write(this.toString())
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    console.log('tcp connection connected!')
                    console.log('===info wait to send to target server===\n' + this.toString())

                    connection.write(this.toString())

                });
            }

            connection.on('data', (dataChunk) => {
                console.log('========net on data======')
                console.log(dataChunk)
                console.log(dataChunk.toString())
                responseParser.receive(dataChunk.toString())

                if (responseParser.isFinished) {
                    resolve(responseParser.response)
                    connection.end();
                }
            }).on('error', (e) => {
                reject(e);
                connection.end();
            })

        })

    }
}


/**
 * the response plainText:

[
  'HTTP/1.1 200 OK\r\n' +
    'Content-Type: text/html\r\n' +
    'Date: Thu, 15 Apr 2021 04:48:23 GMT\r\n' +
    'Connection: keep-alive\r\n' +
    'Keep-Alive: timeout=5\r\n' +
    'Transfer-Encoding: chunked\r\n' +
    '\r\n' +
    '11\r\n' +
    'Hello toy-broswer\r\n' +
    '0\r\n' +
    '\r\n'
]
 */


/**
 * response 解析规则:
 * 
 * 1. 初始即解析 response line 
 * 2. response line: 以 space（空格）分隔 method、statusCode、status Text
 * 3. 遇到 \r\n 标志 response line 解析结束，开始进入 response headers 解析
 * 4. response headers:  key: value（以冒号空格分隔）  遇到 \r\n 则进入下一个 header key 的解析
 * 5. 直到 解析 header key 时仍然遇到了 \r\n  则标志着 response headers 解析结束，开始进入 response body
 */
class ResonseParser {

    constructor() {
        this.httpVersion = '';
        this.statusCode = '';
        this.statusText = '';
        this.responseHeaders = {};
        this.responseBody = '';
        this.tempHeaderKey = '';
        this.tempHeaderValue = '';
        this.contentLength = '';

        this.isFinished = false;
    }

    get response() {
        const response = {}
        response.statusCode = this.statusCode;
        response.statusText = this.statusText;
        response.responseHeaders = this.responseHeaders;
        response.responseBody = this.responseBody;

        return response;
    }

    receive(dataString) {
        for (let character of dataString) {
            this.getStatus = this.getStatus(character)
        }
    }

    getStatus(character) {
        // start status
        return this.getHttpVersion(character);
    }

    getHttpVersion(character) {
        if (character !== ' ') {
            this.httpVersion += character;
            return this.getHttpVersion;
        } else {
            return this.getStatusCode;
        }
    }

    getStatusCode(character) {
        if (character !== ' ') {
            this.statusCode += character;
            return this.getStatusCode;
        } else {
            return this.getStatusText;
        }
    }

    getStatusText(character) {
        if (character !== '\r' && character !== '\n') {
            this.statusText += character;
            return this.getStatusText;
        } else if (character === '\r') {
            return this.getStatusText;
        } else if (character === '\n') {
            return this.getResponseHeaderKey;
        }
    }

    getResponseHeaderKey(character) {
        const splitSymbols = [':', ' ', '\r', '\n']
        if (!splitSymbols.includes(character)) {
            this.tempHeaderKey += character;
            return this.getResponseHeaderKey;
        } else {
            if (character === ':') {
                return this.getResponseHeaderKey;
            } else if (character === ' ') {
                return this.getResponseHeaderValue;
            } else if (character === '\r') {
                return this.getResponseHeaderKey;
            } else if (character === '\n') {
                return this.getResponseBodyStart;
            }
        }
    }

    getResponseHeaderValue(character) {
        const splitSymbols = ['\r', '\n']

        if (!splitSymbols.includes(character)) {
            this.tempHeaderValue += character;
            return this.getResponseHeaderValue;

        } else if (character === '\r') {
            this.responseHeaders[this.tempHeaderKey] = this.tempHeaderValue;
            this.tempHeaderKey = '';
            this.tempHeaderValue = '';
            return this.getResponseHeaderValue;

        } else if (character === '\n') {
            return this.getResponseHeaderKey;
        }
    }

    getResponseBodyStart(character) {
        if (character === '\r') {
            return this.getResponseBodyStart;
        } else if (character === '\n') {
            // contentLength 原始值为 16 进制
            this.contentLength = parseInt(this.contentLength, 16)
            return this.getResponseBody;
        } else {
            this.contentLength += character;
            return this.getResponseBodyStart;
        }

    }

    getResponseBody(character) {
        if (this.contentLength > 0) {
            this.responseBody += character;
            this.contentLength--;
            return this.getResponseBody;
        } else {
            return this.getResponseEnd;
        }
    }

    getResponseEnd(character) {
        this.isFinished = true;
        return this.getResponseEnd;
    }
}

async function makeRequest() {

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
    console.log(response)

}

makeRequest()