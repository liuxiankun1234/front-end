const EOF = Symbol('End Of File')
function parserHTML(html) {
    let state = data;
    for(let char of html) {
        state = state(char)
    }
    state = state(EOF)
}
export {
    parserHTML
}