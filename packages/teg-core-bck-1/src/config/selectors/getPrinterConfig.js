import { createSelector } from 'reselect'

const getPrinterConfig = createSelector(
  config => config,
  config => config.printer,
)

export default getPrinterConfig
