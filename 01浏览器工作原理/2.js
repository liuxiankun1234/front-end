/**
 *  待处理
 *      Content-type四种常用的编码格式是什么 对应的body解析是啥
 *      到底做了一件什么事，整个请求的流程是什么？
 *      Transfer-Encoding: chunked 什么意思？？ 有多少种值
 *      
*/
const net = require('net');

const setRequestParamsDefault = {
    method: 'GET',
    port: 80,
    path: '/',
    body: {}
}

class Request{
    constructor(params) {
        this.host = params.host;
        this.headers = params.headers;
        this.port = params.port || setRequestParamsDefault.port;
        this.path = params.path || setRequestParamsDefault.path;
        this.method = params.method || setRequestParamsDefault.method;
        this.body = params.body || setRequestParamsDefault.body;

        if(!this.headers['Content-type']) {
            this.headers['Content-type'] = 'application/x-www-form-urlencoded'
        }

        // TODO 待补充常用的四种ContentType 
        switch(this.headers['Content-type']) {
            case 'application/json':
                this.bodyText = JSON.stringify(this.body)
                break;
            case 'application/x-www-form-urlencoded':
                    this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
                break;
        }
        
        this.headers['Content-Length'] = this.bodyText.length;
    }
    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser();

            if(connection) {
                connection.write(this.toString())
            }else{
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString())
                })
            }

            connection.on('data', (data) => {
                console.log(data.toString())
                parser.receive(data.toString());

                if(parser.isFinished) {
                    resolve(parser.response)
                    connection.end()
                }
            })
            connection.on('error', (data) => {
                console.log(data.toString())

                parser.receive(data.toString());

                if(parser.isFinished) {
                    resolve(parser.response)
                    connection.end()
                }
            })
        })
    }
    toString() {
        const requestLine = `${this.method} ${this.path} HTTP/1.1`;
        const requestHeaders = `${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}`;
        const requestBody = `${this.bodyText}`
        return `${requestLine}\r\n${requestHeaders}\r\n\r\n${requestBody}`
    }
}


class ResponseParser{
    constructor() {
        /**
         *  状态码是解析响应报文的分隔符
         *  响应报文格式
         *      <version> <status> <reason-phrase>\r\n
         *      <headers>\r\n
         *          可以由零个或者多个首部，每个首部包含一个名字，后面跟着一个冒号(:)，然后是一个可选空格 然后是value值
         *      <enrity-body>
         * 
         *  注意
         *      响应行是通过\r\n分隔
         *      每一个headers的key:value也是通过\r\n分隔 
        **/
        this.WAITTING_STATUS_LINE = 0;
        this.WAITTING_STATUS_LINE_END = 1;
        this.WAITTING_HEADER_NAME = 2;
        this.WAITTING_HEADER_SPACE = 3;
        this.WAITTING_HEADER_VALUE = 4;
        this.WAITTING_HEADER_LINE_END = 5;
        this.WAITTING_HEADER_BLOCK_END = 6;
        this.WAITTING_BODY = 7;

        this.status = this.WAITTING_STATUS_LINE
        this.statusLine = ''
        this.headers = {}
        this.headerName = ''
        this.headerValue = ''
        this.bodyParser = null
    }
    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 (\d+) ([\s\S]+)/)

        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }
    receive(string) {
        for(let c of string) {
            this.receiveChar(c)
        }
    }
    receiveChar(char) {
        /**
         *  就是一个解析响应报文的过程
         *  需要清楚HTTP响应报文格式
        */
        switch(this.status) {
            case this.WAITTING_STATUS_LINE:
                if(char === '\r') {
                    this.status = this.WAITTING_STATUS_LINE_END
                    return
                }
                this.statusLine += char
                break;
            case this.WAITTING_STATUS_LINE_END:
                if(char === '\n') {
                    this.status = this.WAITTING_HEADER_NAME
                }
                break;
            case this.WAITTING_HEADER_NAME:
                if(char === '\r') {
                    this.status = this.WAITTING_HEADER_BLOCK_END
                    if(this.headers['Transfer-Encoding'] === 'chunked') {
                        this.bodyParser = new TrunkedBodyParser()
                    }
                    return;
                }
                if(char === ':') {
                    this.status = this.WAITTING_HEADER_SPACE
                    return;
                }
                this.headerName += char
                break;
            case this.WAITTING_HEADER_SPACE:
                if(char === ' ') {
                    this.status = this.WAITTING_HEADER_VALUE
                    return;
                }
                break;
            case this.WAITTING_HEADER_VALUE:
                if(char === '\r') {
                    this.status = this.WAITTING_HEADER_LINE_END
                    this.headers[this.headerName] = this.headerValue;
                    this.headerName = ''
                    this.headerValue = ''
                    return;
                }
                this.headerValue += char;
                break;
            case this.WAITTING_HEADER_LINE_END:
                if(char === '\n') {
                    this.status = this.WAITTING_HEADER_NAME
                }
                break;
            case this.WAITTING_HEADER_BLOCK_END:
                if(char === '\n') {
                    this.status = this.WAITTING_BODY
                }
                break;
            case this.WAITTING_BODY:
                this.bodyParser.receiveChar(char)
                break;
            
        }
    }   
}
class TrunkedBodyParser{
    constructor() {
        this.WAITTING_LENGTH = 0;
        this.WAITTING_LENGTH_LINE_END = 1;
        this.READING_CRUNK = 2;
        this.WAITTING_NEW_LINE = 3;
        this.WAITTING_NEW_LINE_END = 4;

        this.length = 0;
        this.isFinished = false
        this.content = []
        this.status = this.WAITTING_LENGTH
    }
    receiveChar(char) {
        /**
         *  响应头的body解析流程
         *  先获取body的长度 然后再取body的内容
         * 
         *  响应body的格式 
         *  16进制的数字表示返回内容的长度\r\n
         *  响应内容\r\n
        */
        switch(this.status) {
            case this.WAITTING_LENGTH:
                if(char === '\r') {
                    if(this.length === 0) {
                        this.isFinished = true;
                    }
                    this.status = this.WAITTING_LENGTH_LINE_END
                    return;
                }
                // TODO 为什么先*=16
                this.length *= 16;
                this.length += parseInt(char, 16)
                break;
            case this.WAITTING_LENGTH_LINE_END:
                if(char === '\n') {
                    this.status = this.READING_CRUNK
                }
                break;
            case this.READING_CRUNK:
                this.content.push(char)
                this.length--;
                if(this.length === 0) {
                    this.status = this.WAITTING_NEW_LINE
                }
                break;
            case this.WAITTING_NEW_LINE:
                if(char === '\r') {
                    this.status = this.WAITTING_NEW_LINE_END
                }
                break;
            case this.WAITTING_NEW_LINE_END:
                if(char === '\n') {
                    this.status = this.WAITTING_LENGTH
                }
                break;
        }
    }
}
(function() {
    const request = new Request({
        host: '192.168.31.228',
        port: '3000',
        path: '/',
        method: 'POST',
        headers: {
            ['X-Foo2']: 'customed'
        },
        body: {
            name: 'winter'
        }
    });

    request.send().then(res => {
        console.log(res)
    });
})();