import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

function Submit ({ spoolGCode }) {
  function onChange (e) {
    const file = e.target.files[0]
    const { name } = file
    const fileReader = new FileReader()
    fileReader.readAsText(file)

    fileReader.onload = () => {
      spoolGCode({
        gcode: [fileReader.result],
        // gcode: {
        // TODO: upload objects with names
        //   name,
        //   content: fileReader.result,
        // }
      })
    }
  }

  const onJogClick = (e) => {
    e.preventDefault()
    spoolGCode({
      gcode: ['G91', 'G1 Y20', 'G1 Y-20'],
    })
  }

  const onHeatHotEndClick = (e) => {
    e.preventDefault()
    spoolGCode({
      gcode: ['M104 S180'],
    })
  }

  const onCoolHotEndClick = (e) => {
    e.preventDefault()
    spoolGCode({
      gcode: ['M104 S0'],
    })
  }

  const onSendGCodeClick = (e) => {
    e.preventDefault()
    const gcode = e.target.previousSibling.value.toUpperCase()
    if (gcode.length === 0) return
    spoolGCode({
      gcode: [gcode],
    })
  }

  return (
    <form>
      <h1>Start a print</h1>
      <input name='gcodeFile' type='file' onChange={onChange} />
      <button onClick={onHeatHotEndClick}>Heat (180 degres)</button>
      <button onClick={onCoolHotEndClick}>Cool</button>

      <div>
        <input />
        <button onClick={onSendGCodeClick}>Send</button>
      </div>
    </form>
  )
}

const spoolGCode = gql`
  mutation spoolGCode($gcode: [String!]!) {
    spoolGCode(printerID: "test_printer_id", gcode: $gcode) {
      id
    }
  }
`

export default graphql(spoolGCode, {
  props: ({ mutate }) => ({
    spoolGCode: ({ gcode }) => mutate({
      variables: { gcode },
      // updateQueries: {
      //   allPosts: (previousResult, { mutationResult }) => {
      //     const newPost = mutationResult.data.spoolGCode
      //     return Object.assign({}, previousResult, {
      //       // Append the new post
      //       allPosts: [newPost, ...previousResult.allPosts]
      //     })
      //   }
      // }
    })
  })
})(Submit)
