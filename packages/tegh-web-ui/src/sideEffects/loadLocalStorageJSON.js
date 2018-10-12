const loadLocalStorageJSON = (storageKey) => {
  // eslint-disable-next-line no-undef
  const valueString = localStorage.getItem(storageKey)
  if (valueString == null) return null
  return JSON.parse(valueString)
}

export default loadLocalStorageJSON
