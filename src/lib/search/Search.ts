import FastScanner from 'fastscan'
import type { SearchMatch, SearchMatches } from './search.types'

export class Search {
  private dict: Map<string, SearchMatch> = new Map()
  private scanner: FastScanner

  public async loadDict(url: string) {
    const resp = await fetch(url)
    const text = await resp.text()
    const lines = text.split('\n')
    this.dict = new Map()

    const preDict = new Map<string, SearchMatch[]>()
    for (const [lineno, line] of lines.entries()) {
      if (line.startsWith('//')) {
        continue
      }
      const [extractedKey, ...value] = line.split('：')
      const keys = extractedKey.split('、')
      const definition = value.join('：').trim()
      for (const key of keys) {
        const indexedKey = key.toLowerCase().trim()
        if (indexedKey.length < 1) {
          continue
        }

        if (!definition) {
          console.warn(
            `[FF14划词] 第 ${lineno + 1} 行[${line}]格式不正确；词条[${indexedKey}]缺失定义`
          )
        }
        const spoiler = definition.includes('剧透')

        const defs = preDict.get(indexedKey) || []
        defs.push({
          word: extractedKey,
          definition,
          spoiler,
        })
        preDict.set(indexedKey, defs)
      }
    }

    for (const [indexedKey, defList] of preDict.entries()) {
      for (const value of defList) {
        if (value.definition.startsWith('@')) {
          const pointTo = value.definition.substring(1)
          const target = preDict.get(pointTo.toLowerCase())
          if (target) {
            const joinedMatches = joinMatches(target)
            value.definition = `<span class="WordRef">${pointTo}</span>${joinedMatches.definition}`
            value.spoiler = joinedMatches.spoiler
          } else {
            console.warn(`[FF14划词] 词条[${value.word}]的指向不正确；没有词条[${pointTo}]`)
          }
        }
      }
      this.dict.set(indexedKey, joinMatches(defList))

      const spaceJoined = indexedKey.replace(/(?<!^)\b(?!$)/g, ' ')
      if (spaceJoined !== indexedKey) {
        this.dict.set(spaceJoined, joinMatches(defList))
      }
    }

    this.scanner = new FastScanner([...this.dict.keys()])
  }

  public search(haystack: string): [number, string][] {
    if (this.scanner) {
      return this.scanner.search(haystack)
    } else {
      return []
    }
  }

  public matches(haystack: string): SearchMatches {
    const matches = this.search(haystack.toLowerCase())
    const set = new Set<string>()
    return matches
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value)
      .filter((word) => {
        if (word.match(/^([a-z]+|[0-9]+)$/)) {
          return haystack.match(new RegExp(`\\b${word}\\b`, 'im'))
        } else {
          return true
        }
      })
      .map((key) => ({
        ...this.dict.get(key),
      }))
      .filter(({ word }) => {
        if (set.has(word)) {
          return false
        } else {
          set.add(word)
          return true
        }
      })
  }
}

function joinMatches(matches: SearchMatch[]): SearchMatch {
  const defs = matches.map(({ definition }) => definition)
  const spoiler = matches.some(({ spoiler }) => spoiler)
  return {
    word: matches[0].word,
    definition:
      defs.length > 1 ? '<ol>' + defs.map((v) => `<li>${v}</li>`).join('') + '</ol>' : defs[0],
    spoiler,
  }
}
