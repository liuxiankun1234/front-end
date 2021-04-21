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
 *      响应报文规则
 *          
 * 
*/
class ResponseParser{
    constructor() {
        
    }

    receive(string) {
        for(let char of string) {
            this.receiveChar(char);
        }
    }

    receiveChar(char) {
        console.log(char)
        return char;
    }
}