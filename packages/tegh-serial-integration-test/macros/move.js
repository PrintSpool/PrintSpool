const move = (args, config) => {
  const { axes } = config
  const gcodeWords = ['G1']

  Object.entires(args).forEach(([k, v]) => {
    if (!AXES.includes(k)) throw new Error(`Axis ${k} does not exist`)
    if(typeof(v) !== 'float') throw new Error(`${v} is not a number`)
    gcodeWords.push(`${k}${v}`)
  })
  return gcodeWords.join(' ')
}

export default move
