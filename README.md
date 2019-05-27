# stage0

Collection of low-level DOM tools for building high performance web interfaces using plain old Vanilla JS.

## Eh?

Given a function `h` for building and working with the DOM nodes, organize your work however you like and use the full power of the native DOM API.

## Benefits

- Zero dependencies, tiny size (570B index.js + 1.04Kb reconcile.js).
- No building, no polyfills required.
- No abstractions. Complete freedom over rendering and updating pipelines. The code will do only what you want it to do.
- Template strings. Produce real DOM node ready for cloning or using directly.
- Performance. This library has all of the good ideas of the [domc](https://github.com/Freak613/domc) library, which is already [doing pretty well](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html).
  - [uibench](https://localvoid.github.io/uibench/)
  - [js-framework-benchmark](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html)

Check out the [examples](https://github.com/Freak613/stage0/tree/master/examples)

## How can I use it?

Let's build a simple counter as an example:

```javascript
import h from 'stage0'

// Create view template.
// Mark dynamic references with a #-syntax where needed.
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

A more complex example:

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
// will give you a ready to use DOM node, which you can clone or append directly wherever you need

// h augments the dom node with a function `collect` which collects and memoizes references to DOM nodes

const refs = node.collect(node)
// refs === {root: Node, header: Node, content: Node}
```

## setupSyntheticEvent
```javascript
import {setupSyntheticEvent} from 'stage0/syntheticEvents'

setupSyntheticEvent('click')
// will setup a global event handler that will run the handler from nearest predecessor in the DOM tree,
// greatly reducing the number of listeners on the page

// To attach an event handler to a dom node, simply do
node.__click = () => console.debug('click')
```

## reconcile
```javascript
import reconcile from 'stage0/reconcile'

// Reconcile nodes in the given parent, comparing new and previous data arrays.
// Used for displaying node arrays.
// Good for arrays with mutable data, because it compares array items directly.
reconcile(
    parent,
    renderedValues,
    newValues,
    // Create callback
    item => document.createTextNode(item),
    // Optional, update callback
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
    // Optional, update callback
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
    // Optional, update callback
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

// Utility for generating keyframes, similar to `styles`
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
