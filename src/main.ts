import FloatWindow from './lib/FloatWindow.svelte'
import { PowerfulSelection } from './lib/PowerfulSelection'
import { Searcher } from './lib/search'
import type { SearchMatches } from './lib/search/search.types'

function getDictUrl() {
  return (
    getMetaContent('xivdict-dict-url') ||
    'https://cdn.jsdelivr.net/gh/thewakingsands/xivdict-glossary@master/glossary.txt'
  )
}

function getMetaContent(key: string): string {
  const meta = document.querySelector(`meta[name="${key}"]`)
  if (meta) {
    return meta.getAttribute('content')
  }
  return ''
}

async function start() {
  const searcher = new Searcher()
  await searcher.init(getDictUrl())

  let isFocus = false
  let lastText = ''

  const floatWindow = document.createElement('div')
  floatWindow.tabIndex = 0
  floatWindow.style.position = 'fixed'
  floatWindow.style.zIndex = '2147483647'
  floatWindow.style.userSelect = 'none'
  floatWindow.style.fontSize = '14px'

  const floatWindowApp = new FloatWindow({
    target: floatWindow,
    props: {
      words: [],
    },
  })

  floatWindow.addEventListener('click', (e) => {
    for (
      let target = e.target as HTMLElement;
      target && target != this;
      target = target.parentNode as HTMLElement
    ) {
      if (target.tagName == 'A') {
        const a = target as HTMLAnchorElement
        a.rel = 'noopener noreferrer'
        a.target = '_blank'
        break
      }
    }
  })

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

  let selectionTimer: any
  document.addEventListener('selectionchange', () => {
    if (isFocus) {
      return
    }
    const selection = PowerfulSelection.fromUserSelection()
    clearTimeout(selectionTimer)
    selectionTimer = setTimeout(() => {
      handleSelectionChange(selection)
    }, 100)
  })

  function handleSelectionChange(selection: PowerfulSelection) {
    floatWindow.style.userSelect = 'none'
    floatWindowApp.$set({ words: [] })
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
            // floatWindowApp.$set({ words })
            floatWindowApp.words = words
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
  }
}

start().catch(console.error)
