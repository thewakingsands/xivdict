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

  document.body.appendChild(floatWindow)

  followSelectionTip()

  function followSelectionTip() {
    floatWindow.style.userSelect = 'none'

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

    let lastTrigger: number = 0
    let selectionTimer: any
    document.addEventListener('selectionchange', () => {
      if (isFocus) {
        return
      }
      const selection = PowerfulSelection.fromUserSelection()
      clearTimeout(selectionTimer)
      selectionTimer = setTimeout(() => {
        lastTrigger = Date.now()
        handleSelectionChange(selection)
      }, 100)

      if (Date.now() - lastTrigger > 1000) {
        handleSelectionChange(selection)
        lastTrigger = Date.now()
        clearTimeout(selectionTimer)
      }
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

            moveFloatWindow(...selection.getFloatWindowReference())
          })
          .catch(console.error)
      }
    }
  }

  function moveFloatWindow(x: number, y: number) {
    floatWindow.style.bottom = 'unset'
    floatWindow.style.right = 'unset'
    floatWindow.style.top = `${Math.max(x, 0) + 24}px`
    floatWindow.style.left = `${Math.max(y, 0) + 24}px`

    let rect = floatWindow.getBoundingClientRect()
    if (rect.bottom > window.innerHeight || rect.right > window.innerWidth) {
      floatWindow.style.bottom = 'unset'
      floatWindow.style.right = 'unset'
      floatWindow.style.top = `${Math.max(x, 0) + 24}px`
      floatWindow.style.left = `${Math.max(y, 0) + 24}px`
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
  }
}

start().catch(console.error)
