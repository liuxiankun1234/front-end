function stateM(string) {
    state = foundA;
    for(let  char of string){
        state = state(char)
    }

    return state === end
}

function end() {
    return end;
}

function foundA(char) {
    if(char === 'a') {
        return foundB;
    }
    return foundA;
}

function foundB(char) {
    if(char === 'b') {
        return foundC;
    }
    return foundA(char);
}
function foundC(char) {
    if(char === 'c') {
        return found2A;
    }
    return foundA(char);
}
function found2A(char) {
    if(char === 'a') {
        return found2B;
    }
    return foundA(char);
}
function found2B(char) {
    if(char === 'b') {
        return foundX;
    }
    return foundA(char);
}

function foundX(char) {
    if(char === 'x') {
        return end;
    }
    return foundC(char)
}

stateM('ababcabcabx')