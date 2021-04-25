/***
 *  HTML解析
 *      HTML解析文档
 *          https://html.spec.whatwg.org/#tokenization
 *      tag种类
 *          开始标签(openTag)
 *          结束标签(closeTag)
 *          自闭和标签(selfColseTag)
 *      标签开始不能有空格
 *          < div>              被认为是文本节点    '< div>'
 *          < div>S< /div>      被认为是文本节点    '< div>S< /div>'
 * 
*/
const EOF = Symbol('End Of File')

let currentToken        = null;
let currentAttribute    = null;
const stack = [
    {
        type: 'document',
        children: []
    }
]
console.log(122)
function emit(token) {
    if(token.type === 'text') {
        return;
    }
    const top = stack[stack.length - 1];
    if(token.type === 'startTag') {
        const element = {
            type: 'element',
            children: [],
            attributes: []
        }   

        element.tagName = token.tagName

        Object.keys(token).forEach(key => {
            if(key === 'type' || key === 'tagName') return;
            element.attributes.push({
                name: key,
                value: token[key]
            })
        })

        top.children.push(element)
        element.parent = top;

        if(!token.isSelfClosing) {
            stack.push(element)
        }
    }else if(token.type === 'endTag') {
        if(top.tagName !== token.tagName) {
            throw new Error('tag start end do not match')
        }else{
            stack.pop()
        }
    }
    console.log(stack)
}

function data(c) {
    /**
     *  <
     *      匹配到标签的开始
     *          <div><span></span></div>
     * 
    **/
    if(c === '<') {
        return tagOpen
    }else if(c === EOF) {
        emit({
            type: EOF
        })
        return 
    }else{
        emit({
            type: 'text',
            content: c
        })
        return data;
    }
}
function tagOpen(c) {
    /**
     *  已经匹配到标签开始<,接下来有三种情况
     *      /       
     *          表示结束标签 </div>
     *      /^[a-zA-Z]$/i
     *          表示tagName <div>
     *      其他情况
     *          表示文本节点 <123>
    **/
    if(c === '/') {
        return endTagOpen
    }else if(/^[a-zA-Z]$/.test(c)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(c)
    }else {
        emit({
            type: 'text',
            content: c
        })
        return data;
    }
}

function tagName(c) {
    /**
     *  例子<div>或者</div>，已经匹配完<|</，接下来匹配规则
     *      '/'
     *          这个'/' 仅能在字母之后出现，仅表示自闭和标签 <br />,因为进入tagName函数，所以/不能是结束标签了，只能是自闭和标签
     *      ' ' 
     *          表示tagName匹配完成，开始匹配属性 <div class="name">
     *      >
     *          表示当前标签规则匹配完成
     *      其他
     *          拼接tagName
    */
    if(c === '/'){
        currentToken.isSelfClosing = true;
        return selfClosingStartTag;
    }else if(c === ' '){
        return beforeAttributeName
    }else if(c === '>'){
        emit(currentToken)
        return data;
    }else{
        currentToken.tagName += c;
        return tagName;
    }
}
function endTagOpen(c) {
    /**
     *  已经匹配到</，接下来有几种请情况
     *      /^[a-zA-Z]$/
     *          表示匹配到tagName </div>
     *      ？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？
    **/
    if(/^[a-zA-Z]$/.test(c)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(c)
    }else if(c === '>') {
        
    }else if(c === EOF) {

    }else {

    }
}
function selfClosingStartTag(c) {
    if(c === '>') {
        return data;
    }else if(c === EOF){
        return ;
    }else{
        return ;
    }
}

function beforeAttributeName(c) {
    /**
     *  例子<div    class='name'>，已经匹配完<div ，开始匹配属性，有几种情况
     *      ' '
     *          返回beforeAttributeName函数，继续等待attribute
     *      '>' || '/' || EOF
     *          表示当前标签结束了 <div class>
     *      '='
     *          表示进入到beforeAttributeValue <div class="name">
     *      
     * 
     * 
     * 
     * 
    */
    if(c === ' ') {
        return beforeAttributeName
    }else if(c === '>' || c === '/' || c === EOF){
        return afterAttributeName(c);
    }else if(c === '='){

    }else{
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(c)
    }
}
function attributeName(c) {
    if(c === ' ' || c === '/' || c === '>' || c === EOF) {
        return afterAttributeName(c)
    }else if(c === '=') {
        return beforeAttributeValue
    }else if(c === '\u0000') {

    }else if(c === '\"' || c === '\'' || c === '<') {
        return 
    }else{
        currentAttribute.name += c;
        return attributeName
    }
}
function beforeAttributeValue(c) {
    if(c === ' ' || c === '/' || c === '>' || c === EOF) {
        return beforeAttributeValue;
    }else if(c === '\'') {
        return singleQuotedAttributeValue;
    }else if(c === '"') {
        return doubleQuotedAttributeValue;
    }else {
        return unQuotedAttributeValue;
    }
}
function doubleQuotedAttributeValue(c) {
    if(c === '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if(c === '\u0000') {

    }else if(c === EOF) {

    }else{
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}
function singleQuotedAttributeValue(c) {
    if(c === '\'') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if(c === '\u0000') {

    }else if(c === EOF) {

    }else{
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
}
function afterQuotedAttributeValue(c) {
    /*
     *  <div class="name"data-js="s">
     *      当匹配attributeValue之后，在遇到连续的字符属于违法 继续拼接到属性值上去
     * 
     * 
    */

    if(c === ' ') {
        return beforeAttributeName;
    }else if(c === '/') {
        return selfClosingStartTag;
    }else if(c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken)
        return data;
    }else if(c === EOF) {

    }else {
        currentAttribute.value += c
        return afterQuotedAttributeValue
    }
}
function unQuotedAttributeValue(c) {
    if(c === ' ') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName
    }else if(c === '/') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    }else if(c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken)
        return data;
    }else if(c === '\u0000'){

    }else if(c === '\"' || c === '\'' || c === '<' || c === '=' || c === '`') {

    }else if(c === EOF) {

    }else {
        currentAttribute.value += c;
        return unQuotedAttributeValue
    }
}
function afterAttributeName(c) {
    if(c === ' ') {
        return afterAttributeName;
    }else if(c === '/') {
        return selfClosingStartTag
    }else if(c === '=') {
        return beforeAttributeValue
    }else if(c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data;
    }else if(c === EOF){

    }else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: '',
            value
        }
        return attributeName(c);
    }
}
function parserHTML(html) {
    let state = data;
    for(let c of html) {
        state = state(c)
    }
    state = state(EOF)
}
export {
    parserHTML
}