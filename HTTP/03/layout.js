module.exports = layout;


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


function layout(element) {
    if (!element.computedStyle) return;

    let elementStyle = getStyle(element)
    if (elementStyle.display !== 'flex') return;

    var items = element.children.filter(e => e.type === 'element')
    items.sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
    })

    var style = elementStyle;

    ['width', 'height'].forEach(size => {
        if (style[size] === 'auto' || style[size] === '') {
            style[size] = null;
        }
    })

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
        alignContent: 'stretch',
    }

    Object.keys(defaultSettings).forEach(styleAttr => {
        if (!style[styleAttr] || style[styleAttr]) {
            style[styleAttr] = defaultSettings[styleAttr];
        }
    })

    var mainSize;
    var mainStart;
    var mainEnd;
    var mainSign;
    var mainBase;
    var crossSize;
    var crossStart;
    var crossEnd;
    var crossSign;
    var crossBase;


    if(style.flexDirection==='row'){
        mainSize='width';
        mainStart='left';
        mainEnd='right';
        mainSign=+1;
        mainBase = 0;

        crossSize = 'height';
        crossStart='top';
        crossEnd='bottom';
    }

    if(style.flexDirection=='row-reverse'){

    }

    if(style.flexDirection=='colunmn'){
        
    }

    if(style.flexDirection=='colunmn-reverse'){
        
    }

    if(style.flexWrap=='wrap-reverse'){
        
    }else{
        
    }


}