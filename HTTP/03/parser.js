/**
 * 分为四个步骤逐渐完善parser
 * 1. 只引入状态迁移  包含开始标签、结束标签、自封闭标签
 * 2. 引入标签处理的业务逻辑
 * 3. 处理属性
 * 
 * case1：
 * <html attr=123 />
 * 
 * case 2： 兼容双引号
 * <html attr="123" />
 * 
 * case 3:  正常非自闭和标签
 * <div> </div>
 * 
 * todo1: 兼容单引号
 * <html attr='123' />
 * todo2: 兼容自封闭标签 (已完成)
 * <div><input /> </div> 
 * 
 */

const css = require('css')
let currentToken = null
let currentAttribute = null

const EOF = Symbol('EOF') // end of file

let stack = [{ type: 'document', children: [] }]

let element = null;
let cssRules = []

function addCSSRules(cssText) {
    console.log(cssText)
    let cssAST = css.parse(cssText);
    cssRules.push(...cssAST.stylesheet.rules)
    // console.log(JSON.stringify(cssAST,null,2) )
}

function computeCSS(element) {
    console.log(cssRules)
}
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
        for (let prop of token.props) {
            element.attribute.push(prop)
        }

        computeCSS(element)

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

        if (top.type === token.tagName || token.isSelfClosing) {
            const wrapper = stack[stack.length - 2];
            wrapper.children.push(top);

            if (token.tagName === 'style') {
                addCSSRules(top.children[0].content);
            }

            stack.pop();

        } else {
            throw new Error(`startTag doesn't match endTag`);
        }
    }

    // console.log(token)
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
            props: []
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
        // emit(currentToken);
        return beforeAttributeName;
    } else if (character === '>') {
        emit(currentToken)
        return data
    }
}

function beforeAttributeName(character) {
    if (character === '>') {
        emit(currentToken)
        return data;
    } else if (character.match(/^[\n\t\f\s]$/)) {
        return beforeAttributeName;
    } else if (character.match(/^[a-zA-Z]$/)) {
        currentAttribute = {
            name: '',
            value: '',
        }

        return attributeName(character);
    } else if (character === '/') {
        return selfClosing;
    }
}

function selfClosing(character) {
    if (character === '>') {
        emit(currentToken);
        
        emit({
            type: 'endTag',
            isSelfClosing: true,
        })

        return data

    } else {
        return selfClosing;
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
        currentToken.props.push(currentAttribute)
        currentAttribute = {
            name: '',
            value: ''
        }

        return afterAttribute;
    } else {
        currentAttribute.value += character;
        return attributeValue;
    }
}

function afterAttribute(character) {
    if (character === '>') {
        emit(currentToken);
        return data

    } else if (character === '/') {
        emit(currentToken);
        return selfClosing;
    } else {
        return beforeAttributeName(character);
    }
}

function endTagOpen(character) {
    if (character.match(/^[\n\t\f\s]$/)) {
        return endTagOpen
    } else if (character === '>') {
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

let case1 = `
<html lang="en">
	<head>
		<style>
			.root {
				width: 100%;
				min-height: 300px;
			}
		</style>
		<title>browser test</title>
	</head>
	<body>
		<div class="root">
			<div class="child-1">child-1</div>
			<div class="child-2">child-2</div>
			<div class="child-3">child-3</div>
			<input value="test" />
		</div>
	</body>
</html>
`
// console.log(case1)
// case1 = '<div value="test" name="daipeng" />'
parserHTML(case1)
// console.log(JSON.stringify(stack[0], null, 2))

module.exports = {
    parserHTML,
}