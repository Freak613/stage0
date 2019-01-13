
function collector(node) {
  if (node.nodeType !== 3) {
    if (node.attributes !== undefined) {
      for(let attr of Array.from(node.attributes)) {
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

const TREE_WALKER = document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, false)
TREE_WALKER.roll = function(n) {
  while(--n) this.nextNode()
  return this.currentNode
}

class Ref {
  constructor(idx, ref) {
    this.idx = idx
    this.ref = ref
  }
}

function genPath(node) {
  const w = TREE_WALKER
  w.currentNode = node

  let indices = [], ref, idx = 0
  do {
    if (ref = collector(node)) {
      indices.push(new Ref(idx+1, ref))
      idx = 1
    } else {
      idx++
    }
  } while(node = w.nextNode())

  return indices
}

function walker(node) {
  const refs = {}

  const w = TREE_WALKER
  w.currentNode = node

  this._refPaths.map(x => refs[x.ref] = w.roll(x.idx))

  return refs
}

export function compile(node) {
    node._refPaths = genPath(node)
    node.collect = walker
}

const compilerTemplate = document.createElement('template')
export function h(strings, ...args) {
  const template = String.raw(strings, ...args)
    .replace(/>\n+/g, '>')
    .replace(/\s+</g, '<')
    .replace(/>\s+/g, '>')
    .replace(/\n\s+/g, '<!-- -->')
  compilerTemplate.innerHTML = template
  const content = compilerTemplate.content.firstChild
  compile(content)
  return content
}
export default h
