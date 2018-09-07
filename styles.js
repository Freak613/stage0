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
stylesheet.id = 'stage0'
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

export function keyframes(framesObj) {
    for(let name in framesObj) {
        const genName = `${name}-${makeid()}`
        
        const framesIdx = stylesheet.insertRule(`@keyframes ${genName} {}`, stylesheet.cssRules.length)
        const framesSheet = stylesheet.cssRules[framesIdx]
        
        const frames = framesObj[name]

        for(let percent in frames) {
            framesSheet.appendRule(`${percent}% {}`)
            const frameIdx = framesSheet.cssRules.length - 1
            const frameStyle = framesSheet.cssRules[frameIdx].style
            Object.assign(frameStyle, frames[percent])
        }
        
        framesObj[name] = genName
    }

    return framesObj
}

export default styles