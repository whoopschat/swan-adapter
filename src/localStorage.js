const localStorage = {
  get length() {
    const { keys } = swan.getStorageInfoSync()

    return keys.length
  },

  key(n) {
    const { keys } = swan.getStorageInfoSync()

    return keys[n]
  },

  getItem(key) {
    return swan.getStorageSync(key)
  },

  setItem(key, value) {
    return swan.setStorageSync(key, value)
  },

  removeItem(key) {
    swan.removeStorageSync(key)
  },

  clear() {
    swan.clearStorageSync()
  }
}

export default localStorage
