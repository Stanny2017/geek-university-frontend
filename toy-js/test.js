function compileRegExp(regExpType, name) {
    return regExpType[name].source.replace(/<([^>]+)>/g, function (str, $1) {

        // $1  Literal 
        // egExpType[$1].source   <Literal> 
        if (regExpType[$1].source.match(/<([^>]+)>/)) {
            return compileRegExp(regExpType, $1)
        } else {
            return regExpType[$1].source
        }
    })
}

let regExpType = {
    InputElement: /<WhiteSpace>|<LineTerminator>|<Comments>|<Tokens>/,
    WhiteSpace: /\s/,
    LineTerminator: /\n/,
    Comments: /\/\*([^*]|\*[^\/]])*\*\/|\/\/[^\n]+/,
    Tokens: /<Literal>/,
    Literal: /<NumericLiteral>|<BooleanLiteral>|<StringLiteral>/,
    BooleanLiteral: /true|false/,
    StringLiteral: /''/,
    NumericLiteral: / 0 | [1 - 9][0 - 9] * /,
}

let regexp = compileRegExp(regExpType, 'InputElement');
regexp = new RegExp(regexp, 'g')
console.log(regexp)

function scan(str) {
    while (regexp.lastIndex < str.length) {
        let res = regexp.exec(str)
        if (res[0].trim()) {
            console.log(res[0])
        }
    }
}

scan(`
    43
    0true
    432
    // what the fuck
    /*hello world*/
    /*stanny*/
`)