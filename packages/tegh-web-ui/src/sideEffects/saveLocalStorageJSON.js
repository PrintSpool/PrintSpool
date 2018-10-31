const saveLocalStorageJSON = (storageKey, value) => {
  const valueString = JSON.stringify(value)
  // eslint-disable-next-line no-undef
  localStorage.setItem(storageKey, valueString)
}

export default saveLocalStorageJSON
