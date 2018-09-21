# stage0

Collection of low-level DOM tools for building high performant web interfaces using plain old Vanilla JS.

## Eh?

Given `h` function for extracting DOM references, organize work whatever you like and use full power of native DOM API.

## Benefits

- Zero dependencies, tiny size. You barely feel it.
- No building, no polyfills required.
- No abstractions. Complete freedom over rendering and updating pipelines. The code will do only what you want it to do.
- Template strings. You don't need to write DOM API manually, cause cloning is much faster.
- Performance. This library have all good ideas of [domc](https://github.com/Freak613/domc) library, which is already [doing pretty well](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html).
  - [uibench](https://localvoid.github.io/uibench/)
  - [js-framework-benchmark](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html)

Check out [examples](https://github.com/Freak613/stage0/tree/master/examples)

## How can I use it?

Let's build simple counter example:

```javascript
import h from 'stage0'

// Create view template.
// Mark with #-syntax dynamic references that you need.
const view = h`
  <div>
    <h1>#count</h1>
    <button #down>-</button>
    <button #up>+</button>
  </div>
`
function Main() {
    const root = view

    // Collect references to dynamic parts
    const {count, down, up} = view.collect(root)

    const state = {
        count: 0
    }

    down.onclick = () => {
        state.count--
        update()
    }

    up.onclick = () => {
        state.count++
        update()
    }

    const update = () => count.nodeValue = state.count
    update()

    return root
}

document.body.appendChild(Main())
```

More complex example:

```javascript
import h from 'stage0'

const itemView = h`
  <tr>
      <td class="col-md-1">#id</td>
      <td class="col-md-4">
          <a #select>#label</a>
      </td>
      <td class="col-md-1"><a #del><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>
      <td class="col-md-6"></td>
  </tr>
`
function Item(item, scope) {
  const root = itemView
  const {id, label, select, del} = itemView.collect(root)

  // One time data binding
  id.nodeValue = item.id
  label.nodeValue = item.label
  select.onclick = () => scope.select(item)
  del.onclick = () => scope.del(item)

  // Handcrafted update function, we know exactly what parts of component will change after creation
  // and what parameters we need to update the view
  let a = '', a2,
      b = item.label, b2
  root.update = function(selected) {
    a2 = item.id === selected ? 'danger' : ''
    b2 = item.label
    
    if (a2 !== a) a = root.className = a2
    if (b2 !== b) b = label.nodeValue = b2
  }

  return root
}

// Create component
const node = Item({id: 1, label: 'Wow'}, {
    select: item => console.debug({item}),
    del: item => console.debug({item})
})
document.body.appendChild(node)

// And update the node
const selected = 1
node.update(selected)
```

## h
```javascript
import h from 'stage0'

const node = h`
    <div #root>
        <span>#header</span>
        <div #content></div>
    </div>
`
// will give you ready to use DOM node, which you can clone or append directly wherever you need

// h generates function with memoized DOM paths for obtaining references.
// Given #-syntax, you can collect references to DOM nodes in this DOM 
// or cloned or any other DOM node with similar structure.

const refs = node.collect(node)
// refs === {root: Node, header: Node, content: Node}
```

## setupSyntheticEvent
```javascript
import {setupSyntheticEvent} from 'stage0/syntheticEvents'

setupSyntheticEvent('click')
// will setup global event handler, that will run handler from nearest predecessor in DOM tree
// Synthetic Events are used to reduce amount of listeners on page

// To attach event handler, simply do
node.__click = () => console.debug('click')
```

## reconcile
```javascript
import reconcile from 'stage0/reconcile'

// Reconcile nodes in given parent, comparing new and previous data arrays.
// Used for displaying node arrays.
// Good for arrays with mutable data, cause it compares array items directly.
reconcile(
    parent,
    renderedValues,
    newValues,
    // Create callback
    item => document.createTextNode(item),
    // Update callback
    (node, item) => node.nodeValue = item + ' !!!',
    // Optional, node that comes before rendered list
    beforeNode,
    // Optional, node that comes after rendered list
    afterNode
)
```

## keyed
```javascript
import keyed from 'stage0/keyed'

// Reconcile implementation for keyed collections.
// Good for immutable data arrays.
keyed(
    'id',
    parent,
    renderedValues,
    newValues,
    // Create callback
    item => document.createTextNode(item),
    // Update callback
    (node, item) => node.nodeValue = item + ' !!!',
    // Optional, node that comes before rendered list
    beforeNode,
    // Optional, node that comes after rendered list
    afterNode
)
```

## reuseNodes
```javascript
import reuseNodes from 'stage0/reuseNodes'

// Similar to reconcile, with exception that it will not move any node, 
// doing only updates on all nodes and adding/removing nodes if neccessary.
// Used as more performant alternative of reconcile.
// Same as reconcile, it's designed for arrays with mutable items.
reuseNodes(
    parent,
    renderedValues,
    newValues,
    // Create callback
    item => document.createTextNode(item),
    // Update callback
    (node, item) => node.nodeValue = item + ' !!!',
    // Optional, node that comes before rendered list
    beforeNode,
    // Optional, node that comes after rendered list
    afterNode
)
```

## styles
```javascript
import styles from 'stage0/styles'

// Small CSS-in-JS utility for generating classNames and corresponding cssRules in document.head
const s = styles({
    base: {
        display: 'flex',
        // pseudo-classes and pseudo-selectors are supported
        '::before': {
            content: '>'
        },
        // Nested selectors also supported
        ' > div': {
          color: '#DDDDDD'
        }
    }
})
// s will have s.base === 'base-a'
// styles will generate uniq alphabet tokens and append it to the end of className
```

## keyframes
```javascript
import {keyframes} from 'stage0/styles'

// Utility for keyframes generation, similar to `styles`
const s = keyframes({
    effect: {
        0: {
          display: 'flex'
        },
        100: {
          display: 'none'
        }
    }
})
// s will have s.effect === 'effect-a'
```
