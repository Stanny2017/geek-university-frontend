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

const css = require('css');
const layout = require('./layout');
let currentToken = null;
let currentAttribute = null;

const EOF = Symbol('EOF'); // end of file

let stack = [{ type: 'document', children: [] }];

let element = null;
let cssRules = [];

function addCSSRules(cssText) {
	console.log(cssText);
	let cssAST = css.parse(cssText);
	cssRules.push(...cssAST.stylesheet.rules);
}

function match(element, selector) {
	// 不同类型的 css 选择器匹配
	// 简化为只处理 1 #id 2 .class 3 tagName

	if (!element || !element.attributes) return false;

	if (selector.startsWith('#')) {
		// id selector
		// 找出 id 属性然后匹配
		let idProps = element.attributes.filter(attr => {
			if (attr.name === 'id') {
				return true;
			}
		});
		if (!idProps.length) return false;

		let id = idProps[0].value;
		return id === selector.replace('#', '');
	} else if (selector.startsWith('.')) {
		// class selector
		let classProps = element.attributes.filter(attr => {
			if (attr.name === 'class') {
				return true;
			}
		});
		if (!classProps.length) return false;

		let className = classProps[0].value;
		return className === selector.replace('.', '');
	} else {
		// tagName selector

		return selector === element.type;
	}
}

function getSpecificity(selector) {
	// 只考虑四种优先级
	// [inline, id, class , tagName]
	const p = [0, 0, 0, 0];

	const selectorArr = selector.split(' ');
	for (let s of selectorArr) {
		if (s.startsWith('#')) {
			p[1] += 1;
		} else if (s.startsWith('.')) {
			p[2] += 1;
		} else {
			p[3] += 1;
		}
	}

	return p;
}

function compare(sp1, sp2) {
	for (let i = 0; i < 4; i++) {
		if (sp1[i] > sp2[i]) {
			return true;
		} else if (sp1[i] == sp2[i]) {
			continue;
		} else {
			return false;
		}
	}

	return true;
}

function computeCSS(element) {
	let elements = [...stack].reverse();
	if (!element.computedStyle) {
		element.computedStyle = {};
	}

	for (let rule of cssRules) {
		let selectorParts = rule.selectors[0].split(' ').reverse();
		if (!match(element, selectorParts[0])) {
			continue;
		}

		let matched = true;
		// 从后向前匹配, 当前element 还没有 push 到 stack 中
		let j = 0;

		for (let i = 1; i < selectorParts.length; i++) {
			if (!match(elements[j], selectorParts[i])) {
				matched = false;
				break;
			}
			j++;
		}

		if (matched) {
			const currSelector = rule.selectors[0];
			const sp = getSpecificity(currSelector);
			const computedStyle = element.computedStyle;

			// element.computedStyle = {
			//     [rule.property]: {
			//         value: rule.property.value,
			//         specificity: 0
			//     }
			// }

			for (let declaration of rule.declarations) {
				if (!computedStyle[declaration.property]) {
					computedStyle[declaration.property] = {};
				}

				if (!computedStyle[declaration.property].value) {
					computedStyle[declaration.property].value =
						declaration.value;
					computedStyle[declaration.property].specificity = sp;
				} else {
					if (
						compare(
							computedStyle[declaration.property].specificity,
							sp
						)
					) {
						computedStyle[declaration.property].value =
							declaration.value;
						computedStyle[declaration.property].specificity = sp;
					}
				}
			}
			// console.log(`${element} will be add css rule: ${rule}`)
		}
	}
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
			type: 'element',
			attributes: [],
			children: []
		};

		for (let prop of token.props) {
			element.attributes.push(prop);
		}

		computeCSS(element);

		stack.push(element);
	} else if (token.type === 'text') {
		if (top.children[0] && top.children[0].type === 'text') {
			top.children[0].content += token.content;
		} else {
			top.children.push({
				type: 'text',
				content: token.content
			});
		}
	} else if (token.type === 'endTag') {
		if (top.type === token.tagName || token.isSelfClosing) {
			const wrapper = stack[stack.length - 2];
			wrapper.children.push(top);

			if (token.tagName === 'style') {
				addCSSRules(top.children[0].content);
			}

			layout(top);
			stack.pop();
		} else {
			throw new Error(`startTag doesn't match endTag`);
		}
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
		});
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
		};
		return tagName(character);
	} else if (character === '/') {
		currentToken = {
			type: 'endTag',
			tagName: ''
		};
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
		emit(currentToken);
		return data;
	}
}

function beforeAttributeName(character) {
	if (character === '>') {
		emit(currentToken);
		return data;
	} else if (character.match(/^[\n\t\f\s]$/)) {
		return beforeAttributeName;
	} else if (character.match(/^[a-zA-Z]$/)) {
		currentAttribute = {
			name: '',
			value: ''
		};

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
			isSelfClosing: true
		});

		return data;
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
		return attributeName;
	}
}

function beforeAttributeValue(character) {
	if (character === `"`) {
		return attributeValue;
	} else {
		return beforeAttributeValue;
	}
}

function attributeValue(character) {
	if (character === '"') {
		currentToken.props.push(currentAttribute);
		currentAttribute = {
			name: '',
			value: ''
		};

		return afterAttribute;
	} else {
		currentAttribute.value += character;
		return attributeValue;
	}
}

function afterAttribute(character) {
	if (character === '>') {
		emit(currentToken);
		return data;
	} else if (character === '/') {
		emit(currentToken);
		return selfClosing;
	} else {
		return beforeAttributeName(character);
	}
}

function endTagOpen(character) {
	if (character.match(/^[\n\t\f\s]$/)) {
		return endTagOpen;
	} else if (character === '>') {
		return data;
	} else if (character.match(/^[a-zA-Z]$/)) {
		return tagName(character);
	}
}

function parserHTML(htmlString) {
	let state = data;

	for (let character of htmlString) {
		state = state(character);
	}

	// 为什么要有这一行？TODO
	state = state(EOF);
}

let case1 = `
<html lang="en">
	<head>
		<style>
		    body .root {
				width: 100%;
				min-height: 300px;
			}

            .root .child-1{
                color: red;
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
`;
// console.log(case1)
// case1 = '<div value="test" name="daipeng" />'
parserHTML(case1);
console.log(JSON.stringify(stack[0], null, 2));

module.exports = {
	parserHTML
};
