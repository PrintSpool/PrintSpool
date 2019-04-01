import fetch from 'node-fetch'

const fetchFromAutodrop = async ({ url }) => {
  const res = await fetch(url)

  const text = await res.text()

  if (!res.ok) {
    let e = new Error('Could not fetch from Autodrop')

    if (typeof text === 'string' && text[0] === '{') {
      e = new Error(JSON.parse(text).message)
    }

    e.name = res.statusText
    throw e
  }

  return text
}

export default fetchFromAutodrop
