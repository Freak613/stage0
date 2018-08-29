# stage0

Collection of low-level DOM tools for building high performant web interfaces

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
import {setupSyntheticEvent} from 'stage0'

setupSyntheticEvent('click')
// will setup global event handler, that will run handler from nearest predecessor in DOM tree

// To attach event handler, simply do
node.__click = () => console.debug('click')
```

## reconcile
```javascript
import reconcile from 'stage0/reconcile'

// Reconcile nodes in given parent, according to new and previous rendered data arrays
// Used for displaying node arrays
reconcile(
    parent,
    renderedValues,
    newValues,
    // Create callback
    item => document.createTextNode(item),
    // Update callback
    (node, item) => node.nodeValue = item + ' !!!'
)
```

## reuseNodes
```javascript
import reuseNodes from 'stage0/reuseNodes'

// Similar to reconcile, with exception that it will not move any node, 
// doing only updates on all nodes and adding/removing nodes if neccessary
// Used as more performant alternative of reconcile
reuseNodes(
    parent,
    renderedValues,
    newValues,
    // Create callback
    item => document.createTextNode(item),
    // Update callback
    (node, item) => node.nodeValue = item + ' !!!'
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
        }
    }
})
// s will have s.base === 'base-a'
// styles will generate uniq alphabet tokens and append it to the end of className
```
