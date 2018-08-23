// import { compose, withContext } from 'recompose'
import simplePeerTest from './simplePeerTest'

// const enhance = compose(
// )

const p = process.browser ? simplePeerTest({initiator:  false}) : null

const Index = () => (
  <div>
    <input id="signalInput" />
    <div
      onClick={() => p.signal(JSON.parse(
        document.querySelector('#signalInput').value
      ))}
    >
      Submit Signal
    </div>
  </div>
)

// export default enhance(Index)

export default Index
