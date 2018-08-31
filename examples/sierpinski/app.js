import h from 'stage0'
import styles from 'stage0/styles'

const targetSize = 25;

const classNames = styles({
  dot: {
    position: 'absolute',
    background: '#61dafb',
    font: 'normal 15px sans-serif',
    textAlign: 'center',
    cursor: 'pointer',
    width: '32.5px',
    height: '32.5px',
    borderRadius: '16.25px',
    lineHeight: '32.5px'
  },
  container: {
    position: 'absolute',
    transformOrigin: '0 0',
    left: '50%',
    top: '50%',
    width: '10px',
    height: '10px',
    background: '#eee'
  } 
})

function DotsData(x, y, s, text) {
  const dots = []
  function run(x, y, s) {
    if (s <= targetSize) {
      dots.push({ x, y, text })
      return
    }

    let newSize = s / 2
    s /= 2

    run(x, y - (s / 2), s)
    run(x - s, y + (s / 2), s)
    run(x + s, y + (s / 2), s)
  }
  run(x, y, s)
  return dots
}

const dotView = h`<div>#text</div>`
function Dot(dot) {
  const root = dotView.cloneNode(true)
  const refs = dotView.collect(root)

  const x = dot.x - (targetSize / 2)
  const y = dot.y - (targetSize / 2)

  let hover = false

  const {text} = refs
  root.className = classNames.dot

  const style = root.style
  style.left = x + 'px'
  style.top = y + 'px'

  root.onmouseenter = () => hover = true
  root.onmouseleave = () => hover = false

  let a = null, a2,
      b = null, b2
  root.update = function() {
    a2 = hover ? '#ff0' : null
    b2 = hover ? '*' + dot.text + '*' : dot.text

    if (a2 !== a) a = style.background = a2
    if (b2 !== b) b = text.nodeValue = b2
  }

  return root
}

const triangleView = h`<div><div #dots></div></div>`
function SierpinskiTriangle() {
  const root = triangleView
  const refs = triangleView.collect(root)

  const start = new Date().getTime()
  let seconds = 0

  const data = DotsData(0, 0, 1000, seconds)

  const {dots} = refs
  root.className = classNames.container

  const dotsNodes = data.map(dot => dots.appendChild(Dot(dot)))

  setInterval(() => {
    seconds = (seconds % 10) + 1
    for(let i = 0; i < data.length; i++) data[i].text = seconds
  }, 1000)

  const style = root.style

  let t, scale, elapsed
  root.update = function() {
    elapsed = new Date().getTime() - start
    t = (elapsed / 1000) % 10
    scale = 1 + (t > 5 ? 10 - t : t) / 10
    style.transform = 'scaleX(' + (scale / 2.1) + ') scaleY(0.7) translateZ(0.1px)'

    for(let i = 0; i < dotsNodes.length; i++) dotsNodes[i].update()
  }

  return root
}

const app = SierpinskiTriangle()
document.getElementById('main').appendChild(app)

function update() {
  app.update()
  requestAnimationFrame(update);
}
requestAnimationFrame(update);
