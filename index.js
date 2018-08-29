
const nativeToSyntheticEvent = (event, name) => {
    const eventKey = `__${name}`
    let dom = event.target
    while(dom !== null) {
        const eventHandler = dom[eventKey]
        if (eventHandler) {
            eventHandler()
            return
        }
        dom = dom.parentNode
    }
}
const CONFIGURED_SYNTHETIC_EVENTS = {}
export function setupSyntheticEvent(name) {
    if (CONFIGURED_SYNTHETIC_EVENTS[name]) return
    document.addEventListener(name, event => nativeToSyntheticEvent(event, name))
    CONFIGURED_SYNTHETIC_EVENTS[name] = true
}

function collector(node) {
  if (node.nodeType !== 3) {
    if (node.attributes !== undefined) {
      for(let attr of node.attributes) {
        let aname = attr.name
        if (aname[0] === '#') {
          node.removeAttribute(aname)
          return aname.slice(1)
        }
      }
    }
    return 0
  } else {
    let nodeData = node.nodeValue
    if (nodeData[0] === '#') {
      node.nodeValue = ""
      return nodeData.slice(1)
    }
    return 0
  }
}

function walker(node) {
  let skip = false, tmp, pathId = '', prevPathId, pahtIdLen, code1, code2, ref
  code1 = code2 = ''
  if (ref = collector(node)) code2 += `refs.${ref} = node;\n` 
  do {
      if (!skip && (tmp = node.firstChild)) {
          skip = false       

          prevPathId = pathId
          pathId += '_f'
          code1 += `let ${pathId} = ${prevPathId || 'node'}.firstChild;\n` 

          if (ref = collector(tmp)) code2 += `refs.${ref} = ${pathId};\n` 
      } else if (tmp = node.nextSibling) {
          skip = false

          prevPathId = pathId
          pathId += '_n'
          code1 += `let ${pathId} = ${prevPathId || 'node'}.nextSibling;\n` 

          if (ref = collector(tmp)) code2 += `refs.${ref} = ${pathId};\n` 
      } else {
          pahtIdLen = pathId.length
          if (pathId[pahtIdLen - 1] === 'n') {
              pathId = pathId.slice(0, pathId.lastIndexOf('_f_n'))
          } else {
             pathId = pathId.slice(0, pahtIdLen- 2) 
          }
          tmp = node.parentNode
          skip = true
      }
      node = tmp
  } while (node)
  return Function('node', code1 + 'let refs = {};\n' + code2 + 'return refs;\n')
}

const compilerTemplate = document.createElement('template')
export function h(strings) {
  const template = strings[0].replace(/\n*/g, '').replace(/\s*</g, '<').replace(/>\s*/g, '>')
  compilerTemplate.innerHTML = template
  const content = compilerTemplate.content.firstChild
  content.collect = walker(content)
  return content
}
export default h
