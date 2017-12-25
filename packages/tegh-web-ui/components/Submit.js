import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

function Submit ({ sendGCode }) {
  function onChange (e) {
    const file = e.target.files[0]
    const { name } = file
    const fileReader = new FileReader()
    fileReader.readAsText(file)

    fileReader.onload = () => {
      sendGCode({
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
    sendGCode({
      gcode: ['G91', 'G1 Y20', 'G1 Y-20'],
    })
  }

  return (
    <form>
      <h1>Start a print</h1>
      <input name='gcodeFile' type='file' onChange={onChange} />
      <button onClick={onJogClick}>Jog</button>
    </form>
  )
}

const sendGCode = gql`
  mutation sendGCode($gcode: [String!]!) {
    sendGCode(printerID: "test_printer_id", gcode: $gcode) {
      id
    }
  }
`

export default graphql(sendGCode, {
  props: ({ mutate }) => ({
    sendGCode: ({ gcode }) => mutate({
      variables: { gcode },
      // updateQueries: {
      //   allPosts: (previousResult, { mutationResult }) => {
      //     const newPost = mutationResult.data.sendGCode
      //     return Object.assign({}, previousResult, {
      //       // Append the new post
      //       allPosts: [newPost, ...previousResult.allPosts]
      //     })
      //   }
      // }
    })
  })
})(Submit)
