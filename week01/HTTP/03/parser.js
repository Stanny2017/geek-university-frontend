/**
 * 分为四个步骤逐渐完善parser
 * 1. 只引入状态迁移  包含开始标签、结束标签、自封闭标签
 * 2. 引入标签处理的业务逻辑
 * 3. 处理属性
 * 
 * case1：
 * <html attr=123 />
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

let currentToken = null
let currentAttribute = null
const EOF = Symbol('EOF') // end of life

let stack = [{ type: 'document', children: [] }]

let element = null;

/**
 * token type:
 * 1. type: startTag/endTag , tagName
 * 2. name, value (attribute)
 * 3. type: text, content
 */


function emit(token) {

    const top = stack[stack.length - 1];

    if (token.type === 'startTag') {
        element = {
            type: token.tagName,
            attribute: [],
            children: []
        }

        stack.push(element)

    } else if (token.name && token.value) {

        top.attribute.push({
            [token.name]: token.value
        })
    } else if (token.type === 'text') {

        if (top.children[0] && top.children[0].type === 'text') {
            top.children[0].content += token.content
        } else {
            top.children.push({
                type: 'text',
                content: token.content,
            })
        }

    } else if (token.type === 'endTag') {
        if (top.type === token.tagName) {
            const wrapper = stack[stack.length - 2];
            wrapper.children.push(top);
            stack.pop();
        }
    }

    console.log(token)
}

function data(character) {
    if (character === EOF) {
        return;
    } else if (character === '<') {
        return tagOpen;
    } else {
        emit({
            type: 'text',
            content: character
        })
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
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return endTagOpen;
    }
}

function tagName(character) {
    if (character.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += character;
        return tagName;
    } else if (character.match(/^[\n\t\f\s]$/)) {
        emit(currentToken);
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
        currentAttribute = {
            name: '',
            value: '',
        }
        return attributeName(character);
    } else {

    }
}

function attributeName(character) {
    if (character.match(/^[a-zA-Z]$/)) {
        currentAttribute.name += character;

        return attributeName;
    } else if (character === '=') {
        return beforeAttributeValue;
    } else {
        return attributeName
    }
}

function beforeAttributeValue(character) {
    if (character === `"`) {
        return attributeValue;
    } else {
        return beforeAttributeValue
    }
}

function attributeValue(character) {
    if (character === '"') {
        return afterAttribute;
    } else {
        currentAttribute.value += character;
        return attributeValue;
    }
}

function afterAttribute(character) {
    if (character === '>') {
        emit(currentAttribute);
        currentAttribute = {
            name: '',
            value: ''
        }
        return data
    } else if (character.match(/[\n\t\f\s]/)) {
        return afterAttribute;
    } else if (character.match(/[a-zA-Z]/)) {
        emit(currentAttribute);
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(character)
    }
}

function endTagOpen(character) {
    if (character.match(/^[\n\t\f\s]$/)) {
        return endTagOpen
    } else if (character === '>') {
        // selfClosing

        return data;
    } else if (character.match(/^[a-zA-Z]$/)) {

        return tagName(character)
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

const case1 = `
<div name="daipeng" age="20" school="xidian">
    <div>child-div</div>
    <p>i'm paragraph p</p>
</div>
`
console.log(case1)
parserHTML(case1)
console.log(JSON.stringify(stack, null, 2))

module.exports = {
    parserHTML,
}