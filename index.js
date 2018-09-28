
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

const ACTIONS = {}
ACTIONS.TAKE = 0x00000001
ACTIONS.FIRST_CHILD = ACTIONS.TAKE << 1
ACTIONS.NEXT_SIBLING = ACTIONS.FIRST_CHILD << 1
ACTIONS.PARENT_NODE = ACTIONS.NEXT_SIBLING << 1

function genPath(node) {
  let skip = false,
    tmp,
    ref,
    paths = [],
    reflist = [],
    root = node,
    lastTakeIdx

  if (ref = collector(node)) {
    lastTakeIdx = paths.length
    paths.push(ACTIONS.TAKE)
  }
  do {
      if (!skip && (tmp = node.firstChild)) {
          if (tmp.nodeType === 8) {
              tmp.parentNode.removeChild(tmp)
              continue
          }
          skip = false       

          paths.push(ACTIONS.FIRST_CHILD)

          if (ref = collector(tmp)) {
            lastTakeIdx = paths.length
            paths.push(ACTIONS.TAKE)
            reflist.push(ref)
          }
      } else if (tmp = node.nextSibling) {
          if (tmp.nodeType === 8) {
              tmp.parentNode.removeChild(tmp)
              continue
          }
          skip = false

          paths.push(ACTIONS.NEXT_SIBLING)

          if (ref = collector(tmp)) {
            lastTakeIdx = paths.length
            paths.push(ACTIONS.TAKE)
            reflist.push(ref)
          }
      } else {
          paths.push(ACTIONS.PARENT_NODE)
          tmp = node.parentNode
          skip = true
      }
      node = tmp
  } while (node && node !== root)
  paths = new Uint8ClampedArray(paths.slice(0, lastTakeIdx + 1))
  return {paths, reflist}
}

function walker(node) {
  const refs = {}
  const {paths, reflist} = this._refPaths
  const _ = ACTIONS

  let tmp = node, refIdx = 0, path
  for(let i = 0; i < paths.length; i++) {
    path = paths[i]
    if (path & _.TAKE) {
      refs[reflist[refIdx++]] = tmp
    } else if (path & _.FIRST_CHILD) {
      tmp = tmp.firstChild
    } else if (path & _.NEXT_SIBLING) {
      tmp = tmp.nextSibling
    } else if (path & _.PARENT_NODE) {
      tmp = tmp.parentNode
    }
  }

  return refs
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
  content._refPaths = genPath(content)
  content.collect = walker
  return content
}
export default h
