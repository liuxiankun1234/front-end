/**
 *  client.js要做的事是什么
 *      const request = new Request(options)
 *      const requestBody = request.send();
 *      console.log(requestBody) 得到服务端的数据
 *      
 *      options参数定义
 *          host        域名
 *          port        端口
 *          path        请求资源路径(URL)
 *          method      方法
 *          headers     首部字段
 *          data        payload
 * 
 *      需要使用net模块来辅助完成
 *          菜鸟文档    
 *              https://www.runoob.com/nodejs/nodejs-net-module.html
 *      
 *          connection = net.createConnection(options)
 *              创建一个到端口 port 和 主机 host的 TCP 连接 返回一个net.Socket
 *              options
 *                  host 默认 localhost 
 *                  port     
 *          connection.write()
 *              在 socket 上发送数据。第二个参数指定了字符串的编码，默认是 UTF8 编码。
 *          connection.on('data')
 *              
*/
import Request from './Request.js'
import * as parser from './parser.js'

(async function func() {
    const request = new Request({
        host: 'localhost',
        port: '3000',
        path: '/',
        method: 'GET',
        headers: {
            ['Custom-headers']: 'lxk'
        },
        data: {
            name: 'lxk'
        }
    })

    const reponse = await request.send();

    let dom =  parser.parserHTML(reponse.body)

    console.log(dom, JSON.stringify(dom, null, 2))
})()