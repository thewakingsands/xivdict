import FloatWindow from './lib/FloatWindow.svelte'
import { PowerfulSelection } from './lib/PowerfulSelection'
import { Searcher } from './lib/search'
import type { SearchMatches } from './lib/search/search.types'

async function start() {
  const searcher = new Searcher()
  await searcher.init(
    'https://cdn.jsdelivr.net/gh/thewakingsands/xivdict-glossary@master/glossary.txt'
  )

  customElements.define('xd-float-window', FloatWindow as any)

  let isFocus = false
  let lastText = ''

  const floatWindow = document.createElement('xd-float-window') as HTMLElement & {
    words: SearchMatches
  }
  floatWindow.tabIndex = 0

  floatWindow.addEventListener('focus', () => {
    isFocus = true
    floatWindow.style.userSelect = 'text'
  })

  floatWindow.addEventListener('blur', () => {
    isFocus = false
  })

  floatWindow.addEventListener('mouseenter', (e) => {
    if (e.buttons > 0) {
      floatWindow.style.userSelect = 'none'
    } else {
      floatWindow.style.userSelect = 'text'
    }
  })

  floatWindow.addEventListener('mouseleave', (e) => {
    floatWindow.style.userSelect = 'text'
  })

  document.body.appendChild(floatWindow)

  document.addEventListener('selectionchange', () => {
    if (isFocus) {
      return
    }
    floatWindow.style.userSelect = 'none'
    floatWindow.words = []
    const selection = PowerfulSelection.fromUserSelection()
    if (!selection.hasSelectedContent()) {
      lastText = ''
      return
    }

    const currentText = selection.toString()
    if (currentText !== lastText) {
      lastText = selection.toString()
      searcher
        .matches(currentText)
        .then((words) => {
          if (currentText === lastText) {
            floatWindow.words = words
          }

          let rect = floatWindow.getBoundingClientRect()
          if (rect.bottom > window.innerHeight || rect.right > window.innerWidth) {
            const pos = selection.getTopLeftCorner()
            floatWindow.style.bottom = 'unset'
            floatWindow.style.right = 'unset'
            floatWindow.style.top = `${Math.max(pos.x, 0) + 24}px`
            floatWindow.style.left = `${Math.max(pos.y, 0) + 24}px`
          }

          rect = floatWindow.getBoundingClientRect()
          if (rect.bottom > window.innerHeight) {
            floatWindow.style.bottom = '0'
            floatWindow.style.top = 'unset'
          }
          if (rect.right > window.innerWidth) {
            floatWindow.style.right = '0'
            floatWindow.style.left = 'unset'
          }
        })
        .catch(console.error)
    }

    const pos = selection.getBottomRightCorner()
    floatWindow.style.bottom = 'unset'
    floatWindow.style.right = 'unset'
    floatWindow.style.top = `${Math.max(pos.x, 0) + 24}px`
    floatWindow.style.left = `${Math.max(pos.y, 0) + 24}px`
  })
}

start().catch(console.error)
