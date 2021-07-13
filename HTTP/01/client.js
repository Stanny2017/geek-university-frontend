const net = require('net');

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
			this.bodyText = JSON.stringify(this.body);
		}

		if (
			this.headers['Content-Type'] === 'application/x-www-form-urlencoded'
		) {
			this.bodyText = Object.keys(this.body)
				.map(key => `${key}=${encodeURIComponent(this.body[key])}`)
				.join('&');
		}

		this.headers['Content-length'] = this.bodyText.length;
	}

	send() {
		return new Promise((resolve, reject) => {});
	}
}

let request = new Request({
	method: 'post',
	host: '127.0.0.1',
	port: '8080',
	path: '/',
	headers: {
		['X-foo']: 'customed'
	},
	body: {
		name: 'stanny'
	}
});

let response = await request.send();
console.log(response);
