/**
 *  ResponseParser
 *      负责解析响应报文
 *      demo
 *          HTTP/1.1 200 OK
 *          Content-type: text/html
 *          Date: Wed, 21 Apr 2021 09:38:26 GMT
 *          Connection: keep-alive
 *          Transfer-Encoding: chunked
 * 
 *          10d (注：内容主题的length)
 *          <!DOCTYPE html>
 *          <html lang="en">
 *          <head>
 *              <meta charset="UTF-8">
 *              <meta name="viewport" content="width=device-width, initial-scale=1.0">
 *              <meta http-equiv="X-UA-Compatible" content="ie=edge">
 *              <title>Document</title>
 *          </head>  
 *          <body>
 *              你好
 *          </body>
 *          </html>
 *          0  
 *      解析规则
 *          我们需要解析出 响应行 headers body
 *          响应行和headers\r\n关联
 *          每一个header是由\r\n关联
 *          headers结束是以\r\n结束
 *          body是以一个16进制的数字开始 用来表示请求体的内容长度
 * 
*/
class ResponseParser{
    constructor() {
        this.STATUS_START_LINE = 0
        this.STATUS_START_LINE_END = 1
        this.STATUS_START_HEADER_NAME = 2
        this.STATUS_START_HEADER_SPACE = 3
        this.STATUS_START_HEADER_VALUE = 4
        this.STATUS_START_HEADER_BLOCK_END = 5
        this.STATUS_START_BODY = 6

        // 响应行
        this.responseLine = ''
        // 匹配当前字符串的状态
        this.status = this.STATUS_START_LINE;
        this.headers = {}
        this.headerName = ''
        this.headerValue = ''
        this.bodyParser = null;
    }

    receive(string) {
        for(let char of string) {
            this.receiveChar(char);
        }
    }

    receiveChar(char) {
        switch(char) {
            case this.STATUS_START_LINE:
                // 表示当前响应行 结束
                if(char === '\r') {
                    this.status = this.STATUS_START_LINE_END;
                    return;
                }
                this.responseLine += char;
                break
            case this.STATUS_START_LINE_END:
                if(char === '\n') {
                    this.status = this.STATUS_START_HEADER_NAME;
                }
                break
            case this.STATUS_START_HEADER_NAME: 
                // 当前状态匹配到\r证明 响应首部匹配完成 进入首部解析结束状态
                if(char === '\r') {
                    this.status = this.STATUS_START_HEADER_BLOCK_END;
                    // 这块为什么用Transfer-Encoding === 'chunked' 表示结束呢？？？
                    if(this.headers['Transfer-Encoding'] === 'chunked') {
                        this.bodyParser = new TrunkedBodyParser()
                    }
                    return;
                }
                if(char === ':') {
                    this.status = this.STATUS_START_HEADER_SPACE;
                    return;
                }
                this.headerName += char;
                break
            case this.STATUS_START_HEADER_SPACE:
                if(char === ' ') {
                    this.status = this.STATUS_START_HEADER_VALUE;
                }
                break
            case this.STATUS_START_HEADER_VALUE:
                // 匹配到\r证明当前响应首部字段解析完成 进入下递归解析过程
                if(char === '\r') {
                    this.status = this.STATUS_START_HEADER_NAME
                    this.headers[this.headerName] = this.headerValue
                    this.headerName = ''
                    this.headerValue = ''
                    return;
                }
                this.headerValue += char;
                break
            case this.STATUS_START_HEADER_BLOCK_END:
                if(char === '\n') {
                    this.status = this.STATUS_START_BODY
                    return;
                }
                break
            case this.STATUS_START_BODY:
                this.bodyParser.receive(char);
                break
        }
        
        console.log(char)
        return char;
    }
}