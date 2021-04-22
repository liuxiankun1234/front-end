class TrunkedBodyParser{
    constructor() {
        this.WAITTING_LENGTH = 0;
        this.WAITTING_LENGTH_END = 1;
        this.READING_BODY_CHUNK = 2;
        this.WAITTING_NEW_LINE = 3;
        this.WAITTING_NEW_LINE_END = 4;
        // 获取响应主体长度
        this.length = 0;
        this.isFinished = false;
        this.status = this.WAITTING_LENGTH
        this.content = []
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
                    this.status = this.WAITTING_LENGTH_END;
                    return
                }
                /**
                 * 例   
                 *  十进制123
                 *  (1 * 10 + 2) * 10 + 3 === 123
                 *  16进制 '10d'
                 *  (1 * 16 + parseInt(0, 16)) * 16 + parseInt(d, 16) === 269
                 * 
                **/
                this.length *= 16;
                this.length += parseInt(char, 16)
                break;
            case this.WAITTING_LENGTH_END:
                if(char === '\n') {
                    this.status = this.READING_BODY_CHUNK;
                }
                break;
            case this.READING_BODY_CHUNK:
                this.content.push(char)
                this.length--
                if(this.length === 0) {
                    this.status = this.WAITTING_NEW_LINE;
                    return
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

                    if(this.length === 0) {
                        this.isFinished = true;
                    }
                }
                break;
        }
    }
}


export default TrunkedBodyParser;