import { getContext } from 'recompose'
import PropTypes from 'prop-types'

const withPrinterID = () => getContext({
  printerID: PropTypes.string,
})

export default withPrinterID
