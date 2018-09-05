function makeid() {
    const {possible, n} = makeid
    let alphaHex = n.toString(26).split(''), c, r = ''
    while(c = alphaHex.shift()) r += possible[parseInt(c, 26)]
    makeid.n++
    return r
}
makeid.possible = "abcdefghijklmnopqrstuvwxyz"
makeid.n = 0

let stylesheet = document.createElement('style')
stylesheet.id = 'domc'
document.head.appendChild(stylesheet)
stylesheet = stylesheet.sheet

export function styles(stylesObj) {
    for(let className in stylesObj) {
        const genClass = `${className}-${makeid()}`
        
        const ruleIdx = stylesheet.insertRule(`.${genClass} {}`, stylesheet.cssRules.length)
        const ruleStyle = stylesheet.cssRules[ruleIdx].style
        
        const classStyles = stylesObj[className]

        for(let rule in classStyles) {
            if (rule[0] === ':' || rule[0] === ' ') {
                const pseudoRuleIdx = stylesheet.insertRule(`.${genClass}${rule} {}`, stylesheet.cssRules.length)
                const pseudoRuleStyle = stylesheet.cssRules[pseudoRuleIdx].style
                Object.assign(pseudoRuleStyle, classStyles[rule])
                delete classStyles[rule]
            }
        }
        
        Object.assign(ruleStyle, classStyles)
        
        stylesObj[className] = genClass
    }

    return stylesObj
}

export default styles