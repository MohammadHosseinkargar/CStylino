import { promises as fs } from "fs"
import path from "path"

export type CityCacheEntry = {
  lat: number
  lng: number
  updatedAt: string
}

type CityCacheStore = Record<string, CityCacheEntry>

const cachePath = path.join(process.cwd(), "data", "city-cache.json")
let warnedCorruptCache = false

async function readCache(): Promise<CityCacheStore> {
  try {
    const data = await fs.readFile(cachePath, "utf8")
    const trimmed = data.trim()
    if (!trimmed) {
      return {}
    }
    return JSON.parse(trimmed) as CityCacheStore
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return {}
    }
    if (process.env.NODE_ENV !== "production" && !warnedCorruptCache) {
      console.warn("City cache is invalid, resetting:", error)
      warnedCorruptCache = true
    }
    try {
      const brokenName = `city-cache.broken.${Date.now()}.json`
      await fs.rename(cachePath, path.join(path.dirname(cachePath), brokenName))
    } catch {
      // Ignore rename errors for missing/locked files.
    }
    return {}
  }
}

async function writeCache(cache: CityCacheStore) {
  await fs.mkdir(path.dirname(cachePath), { recursive: true })
  const tempPath = `${cachePath}.tmp`
  await fs.writeFile(tempPath, JSON.stringify(cache, null, 2), "utf8")
  await fs.rename(tempPath, cachePath)
}

export async function getCityCache(city: string) {
  const cache = await readCache()
  return cache[city] || null
}

export async function setCityCache(city: string, entry: CityCacheEntry) {
  const cache = await readCache()
  cache[city] = entry
  await writeCache(cache)
}
