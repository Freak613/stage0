
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
          if (tmp.nodeType === 8) {
              tmp.parentNode.removeChild(tmp)
              continue
          }
          skip = false       

          prevPathId = pathId
          pathId += '_f'
          code1 += `let ${pathId} = ${prevPathId || 'node'}.firstChild;\n` 

          if (ref = collector(tmp)) code2 += `refs.${ref} = ${pathId};\n` 
      } else if (tmp = node.nextSibling) {
          if (tmp.nodeType === 8) {
              tmp.parentNode.removeChild(tmp)
              continue
          }
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
export function h(strings, ...args) {
  let result = ''
  for(let i = 0; i < args.length; i++) result += strings[i] + args[i]
  result += strings[strings.length - 1]

  const template = result
    .replace(/>\n+/g, '>')
    .replace(/\s+</g, '<')
    .replace(/>\s+/g, '>')
    .replace(/\n\s+/g, '<!-- -->')
  compilerTemplate.innerHTML = template
  const content = compilerTemplate.content.firstChild
  content.collect = walker(content)
  return content
}
export default h
