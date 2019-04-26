const readFile = file => (
  new Promise((resolve) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.readAsText(file)
  })
)
export default readFile
