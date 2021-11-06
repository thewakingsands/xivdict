import { Search } from './Search'
import type { SearchMatches } from './search.types'

export type WorkerRequest = ['loadDict', string] | ['matches', string]
export type WorkerResponse = ['load'] | ['matches', string, SearchMatches]

// this should be imported async to share the code split config with non-worker assets
// however it's impossible with vite
const search = new Search()

onmessage = (e) => {
  const data = e.data as WorkerRequest
  if (!Array.isArray(data)) {
    return
  }
  if (data[0] === 'loadDict') {
    search.loadDict(data[1]).catch(console.error)
  }
  if (data[0] === 'matches') {
    const matches = search.matches(data[1])
    self.postMessage(['matches', data[1], matches])
  }
}

self.postMessage(['load'])
