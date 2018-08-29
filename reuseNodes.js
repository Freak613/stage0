
export function reuseNodes(parent, renderedValues, data, createFn, noOp) {
    if (data.length === 0) {
        parent.textContent = ""
        return
    }
    if (renderedValues.length > data.length) {
        let i = renderedValues.length, tail = parent.lastChild, tmp
        while(i > data.length) {
            tmp = tail.previousSibling
            parent.removeChild(tail)
            tail = tmp
            i--
        }
    }

    for(let i = 0, item, head = parent.firstChild; i < data.length; i++) {
        item = data[i]
        if (head) {
            noOp(head, item)
        } else {
            head = createFn(item)
            parent.appendChild(head)
        }
        head = head.nextSibling
    }
}
export default reuseNodes
