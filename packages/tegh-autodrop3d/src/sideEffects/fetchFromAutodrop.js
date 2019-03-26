import fetch from 'node-fetch'

const fetchFromAutodrop = async ({ url }) => {
  const res = await fetch(url)

  const text = await res.text()

  if (!res.ok) {
    const e = new Error(JSON.parse(text).message)
    e.name = res.statusText
    throw e
  }

  return text
}

export default fetchFromAutodrop
