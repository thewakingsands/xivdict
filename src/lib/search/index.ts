import type { SearchMatches } from './search.types'
import type { WorkerResponse } from './worker'
import pDefer from 'p-defer'
import type { DeferredPromise } from 'p-defer'
import SearchWorker from './worker?worker'
import { Search } from './Search'

export class Searcher {
  private search?: Search
  private worker?: Worker
  private dictUrl?: string
  private searchDefers: Map<string, { defer: DeferredPromise<SearchMatches>; timer: any }> =
    new Map()
  public timeout = 3000

  public async init(dictUrl: string) {
    this.dictUrl = dictUrl
    try {
      if (!window.Worker) {
        throw new Error('No worker support')
      }
      // this.worker = new (await import('./worker?worker')).default()
      this.worker = new SearchWorker()
      this.worker.addEventListener('message', (e) => {
        this.onMessage(e.data as any)
      })
    } catch {
      // this.search = new (await import('./Search')).Search()
      this.search = new Search()
      await this.search.loadDict(dictUrl)
    }
  }

  public async matches(haystack: string): Promise<SearchMatches> {
    if (this.search) {
      return this.search.matches(haystack)
    }
    if (this.worker) {
      const defer = pDefer<SearchMatches>()
      if (this.searchDefers.has(haystack)) {
        return this.searchDefers.get(haystack).defer.promise
      }
      const timer = setTimeout(() => {
        defer.reject(new Error('timeout'))
        this.searchDefers.delete(haystack)
      }, this.timeout)
      this.searchDefers.set(haystack, { defer, timer })
      this.worker.postMessage(['matches', haystack])
      return defer.promise
    }
    return []
  }

  private onMessage(data: WorkerResponse) {
    if (data[0] === 'load') {
      this.worker.postMessage(['loadDict', this.dictUrl])
    }
    if (data[0] === 'matches') {
      const { defer, timer } = this.searchDefers.get(data[1])
      this.searchDefers.delete(data[1])
      clearTimeout(timer)
      defer.resolve(data[2])
    }
  }
}
