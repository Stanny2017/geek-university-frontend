module.exports = layout;

// 预处理
function getStyle() {
	if (!element.style) {
		element.style = {};
	}

	for (let prop in element.computedStyle) {
		// var p = element.computedStyle.value;
		element.style[prop] = element.computedStyle[prop].value;

		if (element.style[prop].toString().match(/px$/)) {
			element.style[prop] = parseInt(element.style[prop]);
		}

		if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
			element.style[prop] = parseInt(element.style[prop]);
		}
	}
	return element.style;
}

function isElement(element) {
	if (element.type !== 'text') {
		return true;
	}

	return false;
}

function layout(element) {
	if (!element.computedStyle) return;

	let elementStyle = getStyle(element);

	// 只处理 flex 布局，其余的先忽略
	if (elementStyle.display !== 'flex') return;

	// 过滤文本掉节点
	var items = element.children.filter(e => isElement(e));

	items.sort(function (a, b) {
		return (a.order || 0) - (b.order || 0);
	});

	var style = elementStyle;

	['width', 'height'].forEach(size => {
		if (style[size] === 'auto' || style[size] === '') {
			style[size] = null;
		}
	});

	// if (!style.flexDirection || style.flexDirection === 'auto') {
	//     style.flexDirection = 'row';
	// }

	// if (!style.alignItems || style.alignItems === 'auto') {
	//     style.alignItems = ' stretch';
	// }

	// if (!style.justifyContent || style.justifyContent == 'auto') {
	//     style.justifyContent = 'flex-start'
	// }

	// if (!style.flexWrap || style.flexWrap == 'auto') {
	//     style.flexWrap = 'nowrap';
	// }

	// if (!style.alignContent || style.alignContent == 'auto') {
	//     style.alignContent = 'stretch';
	// }

	const defaultSettings = {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		flexWrap: 'nowrap',
		alignItems: 'stretch',
		alignContent: 'stretch'
	};

	Object.keys(defaultSettings).forEach(styleAttr => {
		if (!style[styleAttr] || style[styleAttr]) {
			style[styleAttr] = defaultSettings[styleAttr];
		}
	});

	var mainSize; // 主轴尺寸
	var mainStart;
	var mainEnd;
	var mainSign; // 按方向排布的时候, 属性延伸会相减
	var mainBase; // 从做开始还是 从右开始
	var crossSize;
	var crossStart;
	var crossEnd;
	var crossSign;
	var crossBase;

	if (style.flexDirection === 'row') {
		mainSize = 'width';
		mainStart = 'left';
		mainEnd = 'right';
		mainSign = +1;
		mainBase = 0;

		crossSize = 'height';
		crossStart = 'top';
		crossEnd = 'bottom';
	}

	if (style.flexDirection == 'row-reverse') {
		mainSize = 'width';
		mainStart = 'right';
		mainEnd = 'left';
		mainSign = -1;
		mainBase = style.width; // 从右边开始

		crossSize = 'height';
		crossStart = 'top';
		crossEnd = 'bottom';
	}

	if (style.flexDirection == 'colunmn') {
		mainSize = 'height';
		mainStart = 'top';
		mainEnd = 'bottom';
		mainSign = +1;
		mainBase = 0;

		crossSize = 'width';
		crossStart = 'left';
		crossEnd = 'right';
	}

	if (style.flexDirection == 'colunmn-reverse') {
		mainSize = 'height';
		mainStart = 'bottom';
		mainEnd = 'top';
		mainSign = -1;
		mainBase = style.height; // 从右边开始

		crossSize = 'width';
		crossStart = 'left';
		crossEnd = 'right';
	}

	if (style.flexWrap == 'wrap-reverse') {
		[crossStart, crossEnd] = [crossEnd, crossStart];
		crossSign = -1;
	} else {
		crossBase = 0;
		crossSign = 1;
	}
}
