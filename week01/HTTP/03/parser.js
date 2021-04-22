/**
 * 分为四个步骤逐渐完善parser
 * 1. 只引入状态迁移  包含开始标签、结束标签、自封闭标签
 * 2. 引入标签处理的业务逻辑
 * 3. 处理属性
 * 
 * case1：
 * <html attr=123 />
 * 
 * 
 * case 2： 兼容单引号
 * <html attr='123' />
 * 
 * case 3： 兼容双引号
 * <html attr="123" />
 * 
 * case 4:  正常非自闭和标签
 * <div> </div>
 * 
 */


const currentToken = null
const currentAttribute = null
const EOF = Symbol('EOF') // end of life

function emit(token) {
    console.log(token)
}

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
    if (character.match(/^[\n\t\f\s]$/)) {
        return tagOpen;
    } else if (character.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: '',
        }
        return tagName(character);
    } else if (character === '/') {
        return endTagOpen;
    }
}

function tagName(character) {
    if (character.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += character;
        return tagName;
    } else if (character.match(/^[\n\t\f\s]$/)) {
        return beforeAttributeName;
    } else if (character === '>') {
        emit(currentToken)
        return data
    }
}


function beforeAttributeName(character) {
    if (character === '>') {
        return data;
    } else if (character.match(/^[\n\t\f\s]$/)) {
        return beforeAttributeName;
    } else if (character.match(/^[a-zA-Z]$/)) {
        return attributeName;
    } else {

    }
}

function attributeName(character) {
    if (character.match(/^[a-zA-Z]$/)) {

        return attributeName;
    } else if (character === '=') {
        return attributeName;
    } else if (character === `"`) {

        return beforeAttributeValue
    }
}

function beforeAttributeValue(character) {
    if (character === `"`) {
        return endAttributeValue;
    } else if (character.match(/[a-zA-Z]/)) {
        return attributeValue(character);
    }
}

function endTagOpen(character) {
    if (character.match(/^[\n\t\f\s]$/)) {
        return endTagOpen
    } else if (character === '>') {
        // selfClosing

        return data;
    } else if (character.match(/^[a-zA-Z]$/)) {
        return tagName
    }
}

function parserHTML(htmlString) {
    let state = data;

    for (let character of htmlString) {
        state = state(character);
    }

    // 为什么要有这一行？TODO
    state = state(EOF)
}

module.exports = {
    parserHTML,
}

