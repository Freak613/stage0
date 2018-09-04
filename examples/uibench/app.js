import {h,setupSyntheticEvent} from 'stage0'
import keyed from 'stage0/keyed'
import reconcile from 'stage0/reconcile'

const cellView = h`<td class="TableCell">#text</td>`
function TableCell(data) {
    const root = cellView.cloneNode(true)
    const refs = cellView.collect(root)

    const {text} = refs

    text.nodeValue = data

    root.__click = () => console.log("Click", data)

    let a = data
    root.update = function(data) {
        if (data !== a) a = text.nodeValue = data
    }

    return root
}

const rowView = h`<tr></tr>`
function TableRow(item) {
    const root = rowView.cloneNode(true)

    root.dataset.id = item.id

    const id = TableCell('#' + item.id)
    root.appendChild(id)

    let renderedProps = [],
        a, a2
    root.update = function(item) {
        a2 = item.active ? 'TableRow active' : 'TableRow'

        if (a2 !== a) a = root.className = a2

        reconcile(
            root,
            renderedProps,
            item.props,
            item => TableCell(item),
            (node, item) => node.update(item),
            id
        )
        renderedProps = item.props.slice()
    }
    root.update(item)

    return root
}

const tableView = h`<table class="Table"><tbody #tbody></tbody></table>`
function Table(data) {
    const root = tableView.cloneNode(true)
    const refs = tableView.collect(root)

    const {tbody} = refs

    let renderedItems = []
    root.update = function(data) {
        keyed(
            'id',
            tbody,
            renderedItems,
            data.table.items,
            item => TableRow(item),
            (node, item) => node.update(item)
        )
        renderedItems = data.table.items.slice()
    }
    root.update(data)

    return root
}

const boxView = h`<div class="AnimBox"></div>`
function AnimBox(item) {
    const root = boxView.cloneNode(true)

    root.dataset.id = item.id

    const style = root.style

    let b, b2
    root.update = function(item) {
        b2 = item.time

        if (b2 !== b) {
            style.background = "rgba(0,0,0," + (0.5 + ((b2 % 10) / 10)) + ")"
            style.borderRadius = (b2 % 10) + "px"
            b = b2
        }
    }
    root.update(item)

    return root
}

const animView = h`<div class="Anim"></div>`
function Anim(data) {
    const root = animView.cloneNode(true)

    let renderedItems = []
    root.update = function(data) {
        keyed(
            'id',
            root,
            renderedItems,
            data.anim.items,
            item => AnimBox(item),
            (node, item) => node.update(item)
        )
        renderedItems = data.anim.items.slice()
    }
    root.update(data)

    return root
}

const leafView = h`<li class="TreeLeaf">#id</li>`
function TreeLeaf(node) {
    const root = leafView.cloneNode(true)
    const refs = leafView.collect(root)

    const {id} = refs

    id.nodeValue = node.id

    return root
}

const nodeView = h`<ul class="TreeNode"></ul>`
function TreeNode(node) {
    const root = nodeView.cloneNode(true)

    let renderedItems = []
    root.update = function(node) {
        keyed(
            'id',
            root,
            renderedItems,
            node.children,
            node => node.container ? TreeNode(node) : TreeLeaf(node),
            (node, data) => node.update && node.update(data)
        )
        renderedItems = node.children.slice()
    }
    root.update(node)

    return root
}

const treeView = h`<div class="Tree"></div>`
function Tree(data) {
    const root = treeView.cloneNode(true)

    const node = TreeNode(data.tree.root)
    root.appendChild(node)

    root.update = function(data) {
        node.update(data.tree.root)
    }

    return root
}

const mainView = h`<div class="Main">#section</div>`
function Main() {
    const root = mainView
    const refs = mainView.collect(root)

    let {section} = refs

    function route(location, data) {
        if (location === 'table') {
          return Table(data)
        } else if (location === 'anim') {
          return Anim(data)
        } else if (location === 'tree') {
          return Tree(data)
        }
    }

    let a = '', a2,
        newSection
    root.update = function(data) {
        a2 = data.location

        if (a2 !== a) {
            newSection = route(a2, data)
            root.replaceChild(newSection, section)
            section = newSection
            a = a2
        } else {
            section.update(data)    
        }
    }

    return root
}

uibench.init("stage0", "0.0.2")

document.addEventListener("DOMContentLoaded", e => {
  setupSyntheticEvent('click')

  const container = document.querySelector("#App")
  const app = Main()
  container.appendChild(app)

  uibench.run(
    state => app.update(state),
    samples => console.debug({samples})
  )
})