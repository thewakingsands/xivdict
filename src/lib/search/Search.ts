import FastScanner from 'fastscan'
import type { SearchMatches } from './search.types'

export class Search {
  private dict: Map<string, { definition: string; spoiler: boolean }> = new Map()
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
        const indexedKey = key.trim()
        if (indexedKey.length > 0) {
          if (!definition) {
            console.warn('格式不正确：', indexedKey)
          }
          const spoiler = definition.includes('剧透')
          this.dict.set(indexedKey, {
            definition,
            spoiler,
          })
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
    const matches = this.search(haystack)
    return matches
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value)
      .map((key) => ({
        word: key,
        ...this.dict.get(key),
      }))
  }
}
