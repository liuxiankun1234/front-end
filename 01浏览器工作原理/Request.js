import net from 'net'
import ResponseParser from './ResponseParser.js'
const setRequestParamsDefault = {
    method: 'GET',
    port: 80,
    path: '/',
    data: {}
}

class Request{
    constructor({
        host,
        port = setRequestParamsDefault.port,
        path = setRequestParamsDefault.path,
        method = setRequestParamsDefault.method,
        data = setRequestParamsDefault.data,
        headers
    }) {
        this.host = host
        this.port = port
        this.path = path
        this.method = method
        this.headers = headers
        this.data = data
        /**
         *  使用HTTP/1.1版本 
         *      必须有的首部
         *      Content-type
         *      Content-Length
        */

        if(!this.headers['Content-type']) {
            this.headers['Content-type'] = 'application/x-www-form-urlencoded'
        }

        this.bodyText = ''
        switch(this.headers['Content-type']) {
            case 'json': 
                this.bodyText = JSON.stringify(this.data)
                break;
            case 'application/x-www-form-urlencoded': 
                this.bodyText = Object.keys(this.data).map(key => `${key}=${encodeURIComponent(this.data[key])}`).join('&')
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

            connection.on('data', function(data) {
                console.log(data.toString())
                parser.receive(data.toString())
                if(parser.isFinished) {
                    resolve(parser.response)
                    connection.end()
                }
            })
            connection.on('error', function() {
                reject('error')
                connection.end()
            })
        })
    }
    toString() {
        /**
         *  请求报文格式
         *      请求行 
         *          <method> <request-URL> <version>
         *          用空格分隔
         *      请求首部
         *          key: value
         *          使用\r\n换行
         *      请求实体
         *      请求行、请求首部和请求实体之间通过CRLF(\r\n)换行
         *      详情见
         *      ../../../notes/src/HTTP/HTTP权威指南/第三章 HTTP报文.js
        */
        const requestLine = `${this.method} ${this.path} HTTP/1.1`
        const requestHeaders = `${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}`
        const requestBody = `${this.bodyText}`
        // requestHeaders最后需要补一个\r\n表示当前headers结束 接一个\r\n表示整体headers结束
        return `${requestLine}\r\n${requestHeaders}\r\n\r\n${requestBody}`
    }
}

export default Request