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
    for (const line of lines) {
      const [extractedKey, ...value] = line.split('：')
      const keys = extractedKey.split('、')
      const definition = value.join('：').trim()
      for (const key of keys) {
        const indexedKey = key.toLowerCase().trim()
        if (indexedKey.length > 0) {
          if (!definition) {
            console.warn('格式不正确：', indexedKey)
          }
          const spoiler = definition.includes('剧透')
          this.dict.set(indexedKey, {
            word: extractedKey,
            definition,
            spoiler,
          })
        }
      }
    }

    for (const value of this.dict.values()) {
      if (value.definition.startsWith('@')) {
        const pointTo = value.definition.substring(1)
        const target = this.dict.get(pointTo.toLowerCase())
        if (target) {
          value.definition = target.definition
        } else {
          console.warn('没有找到目标：', pointTo)
        }
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
