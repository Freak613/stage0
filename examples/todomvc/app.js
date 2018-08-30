import h from 'stage0'
import reconcile from 'stage0/reconcile'

const todoView = h`
<li>
    <input class="toggle" type="checkbox" #checkbox>
    <label>#label</label>
    <button class="destroy" #destroy></button>
</li>
`
function Todo(item, scope) {
    const root = todoView.cloneNode(true)
    const refs = todoView.collect(root)

    const {render} = scope

    const {label, checkbox, destroy} = refs
    label.nodeValue = item.title
    root.className = item.completed ? 'completed' : ''
    checkbox.checked = item.completed

    checkbox.onchange = () => {
        item.completed = checkbox.checked
        render()
    }

    destroy.onclick = () => scope.delete(item)

    let a = '', a2,
        b = item.completed, b2
    root.update = function() {
        a2 = item.completed ? 'completed' : ''
        b2 = item.completed

        if (a2 !== a) a = root.className = a2
        if (b2 !== b) b = checkbox.checked = b2
    }

    return root
}

const mainView = h`
    <section class="todoapp">
        <header class="header">
            <h1>todos</h1>
            <input class="new-todo" placeholder="What needs to be done?" autofocus #input>
        </header>
        <section style="display:none" class="main" #body>
            <input id="toggle-all" class="toggle-all" type="checkbox" #toggleall>
            <label for="toggle-all">Mark all as complete</label>
            <ul class="todo-list" #list></ul>
            <footer class="footer">
                <span class="todo-count">#count</span>
                <ul class="filters">
                    <li>
                    <a href="#/" class="selected" #all>All</a>
                    </li>
                    <li>
                    <a href="#/active" #active>Active</a>
                    </li>
                    <li>
                    <a href="#/completed" #completed>Completed</a>
                    </li>
                </ul>
                <button class="clear-completed" #clear>Clear completed</button>
            </footer>
        </section>
    </section>
    <footer class="info">
        <p>Double-click to edit a todo</p>
        <p>Written by <a href="http://twitter.com/lukeed05">Luke Edwards</a></p>
        <p>Refactored by <a href="https://github.com/xorgy">Aaron Muir Hamilton</a></p>
        <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
    </footer>
`
function Main(todos) {
    const root = mainView
    const refs = mainView.collect(root)

    const FILTERS = {
        ALL: () => true,
        ACTIVE: ({completed}) => completed === false,
        COMPLETED: ({completed}) => completed === true
    }
    let filter = FILTERS.ALL

    const {body, input, list, count, clear, toggleall, all, active, completed} = refs
    const bodyStyle = body.style
    const clearStyle = clear.style

    function createTodo() {
        if (input.value === '') return
        todos.unshift({
            id: Date.now(),
            title: input.value,
            completed: false
        })
        input.value = ''
        update()
    }

    input.onkeyup = e => {
        if (e.keyCode === 13) createTodo()
    }
    input.onblur = () => createTodo()

    toggleall.onchange = () => {
        let value = toggleall.checked
        todos.map(t => t.completed = value)
        update()
    }

    all.onclick = () => {
        filter = FILTERS.ALL
        update()
    }

    active.onclick = () => {
        filter = FILTERS.ACTIVE
        update()
    }

    completed.onclick = () => {
        filter = FILTERS.COMPLETED
        update()
    }

    clear.onclick = () => {
        todos = todos.filter(({completed}) => !completed)
        update()
    }

    const scope = {
        render: update,
        delete: item => {
            todos.splice(todos.indexOf(item), 1)
            update()
        }
    }

    let a, a2,
        b, b2,
        c, c2,
        completedTodos, todosCount, visibleTodos, uncompletedTodos,
        renderedTodos = []
    function update() {
        todosCount = todos.length
        completedTodos = todos.filter(({completed}) => completed).length
        uncompletedTodos = todosCount - completedTodos
        visibleTodos = todos.filter(filter)

        a2 = todosCount > 0 ? 'block' : 'none'
        b2 = todosCount > 0 ? `${uncompletedTodos} ${uncompletedTodos === 1 ? 'items' : 'item'} left` : ''
        c2 = completedTodos > 0 ? 'block' : 'none'

        if (a2 !== a) a = bodyStyle.display = a2
        if (b2 !== b) b = count.nodeValue = b2
        if (c2 !== c) c = clearStyle.display = c2

        reconcile(
            list,
            renderedTodos,
            visibleTodos,
            item => Todo(item, scope),
            (node, item) => node.update()
        )
        renderedTodos = visibleTodos.slice()
    }
    update()

    return root
}

const STORE_SIZE = 10000;

const initialState = []

// for (var i = 0; i < STORE_SIZE; i++) {
//   initialState.push({
//     title: 'Item' + i,
//     completed: false,
//     id: i
//   });
// }

const app = Main(initialState)
document.body.appendChild(app)
