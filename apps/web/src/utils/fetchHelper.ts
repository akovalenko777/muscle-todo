import api from "../api/axios"

let cache = new Map<string, Promise<unknown>>()

const getData = async (url: string) => {
  const response = await api.get(url)
  return response.data
}

export function fetchData(url: string){
  if (!cache.has(url)) {
    const promise = getData(url).catch((error) => {
      cache.delete(url)
      throw error
    })

    cache.set(url, promise)
  }
  return  cache.get(url)
}

export function invalidateCache(url: string) {
  cache.delete(url)
}