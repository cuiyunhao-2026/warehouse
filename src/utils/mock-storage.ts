/**
 * Mock数据持久化工具
 * 使用localStorage存储Mock数据，刷新页面后数据不丢失
 */

const STORAGE_KEY_PREFIX = 'mock_'

/**
 * 从localStorage获取数据
 */
export function getMockData<T>(key: string, defaultValue: T): T {
  try {
    const storageKey = STORAGE_KEY_PREFIX + key
    const data = localStorage.getItem(storageKey)
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.warn(`获取Mock数据失败: ${key}`, error)
  }
  return defaultValue
}

/**
 * 保存数据到localStorage
 */
export function setMockData<T>(key: string, data: T): void {
  try {
    const storageKey = STORAGE_KEY_PREFIX + key
    localStorage.setItem(storageKey, JSON.stringify(data))
  } catch (error) {
    console.warn(`保存Mock数据失败: ${key}`, error)
  }
}

/**
 * 删除localStorage中的数据
 */
export function removeMockData(key: string): void {
  try {
    const storageKey = STORAGE_KEY_PREFIX + key
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.warn(`删除Mock数据失败: ${key}`, error)
  }
}

/**
 * 清除所有Mock数据
 */
export function clearAllMockData(): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('清除Mock数据失败', error)
  }
}
