module.exports = {
    parserHTML,
}


const EOF = Symbol('EOF') // end of life
/**
 * 分为四个步骤逐渐完善parser
 * 1. 只引入状态迁移  包含开始标签、结束标签、自封闭标签
 * 2. 引入标签处理的业务逻辑
 * 3. 处理属性
 * 
 * @param {string} htmlString 
 */

function data(character) {
    if (character === EOF) {
        return;
    } else if (character === '<') {
        return tagOpen;
    } else {
        return data;
    }
}

function tagOpen(character) {
    if (character.match(/^[a-zA-Z]$/)) {
        return tagName(character)
    } else if (character === '/') {
        // TODO

    } else {
        return tagOpen
    }

}

function endTagOpen(character) {

}

function tagName(character) {
    if (character.match(/^[a-zA-Z]$/)) {
        return tagName
    } else if (character.match(/^[\t\n\f]$/)) {
        return beforeAttribute
    }

}

// TODO
function beforeAttribute(character) {
    if (character.match(/^[\t\n\f]$/)) {
        return beforeAttribute
    } else if (character === '>') {
        return data
    } else if (character === '=') {
        return beforeAttribute
    } else if (character.match(/^[a-zA-Z]$/)) {
        return beforeAttribute
    }
}

function selfClosingStartTag(character) {

}

function parserHTML(htmlString) {
    let state = data;

    for (let character of htmlString) {
        state = state(character);
    }

    state = state(EOF)
}