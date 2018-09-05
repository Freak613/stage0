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