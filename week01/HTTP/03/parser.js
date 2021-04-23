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

function emit(token) {


    if (token.type === 'startTag') {
        element = {
            type: token.tagName,
            attribute: [],
            children: []
        }
    }

    if (token.name && token.value) {
        element.attribute.push({
            [token.name]: token.value
        })
    }

    if (token.type === 'text') {
        let { children } = element;
        let lastChild;
        if (children.length > 0) {
            lastChild = children[children.length - 1]
            if (lastChild.type === 'text') {
                lastChild.content += token.content;
            } else {
                element.children.push({
                    type: 'text',
                    content: token.content
                })
            }

        } else {
            element.children.push({
                type: 'text',
                content: token.content
            })
        }
    }

    if (token.type === 'endTag') {
        if (element.type === token.tagName) {
            let top = stack[0]
            top.children.push(element)
        }
    }

    console.log(token)
    console.log(element)
    console.log(stack[0].children[0], '======')
    if (stack[0].children[0]) {
        console.log(JSON.stringify(stack[0].children[0]))
    }

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

const case1 = '<div name="daipeng" age="20" school="xidian">xxxxxx</div>'
parserHTML(case1)
// console.log(stack)

module.exports = {
    parserHTML,
}