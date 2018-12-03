// import React from 'react'
// import gql from 'graphql-tag'
// import { compose, withProps } from 'recompose'
// import {
//   Typography,
//   Switch,
//   FormControlLabel,
// } from '@material-ui/core'
//
// import withSpoolMacro from '../../../shared/higherOrderComponents/withSpoolMacro'
//
// const enhance = compose(
//   withSpoolMacro,
//   withProps(({ printer, component, spoolMacro }) => ({
//     toggleFan: (e, val) => {
//       spoolMacro({
//         printerID: printer.id,
//         macro: 'toggleFan',
//         args: { [component.id]: val },
//       })
//     },
//   })),
// )
//
// const targetText = (targetTemperature) => {
//   if (targetTemperature == null) return 'OFF'
//   return `${targetTemperature}°C`
// }
//
// const TemperatureSection = ({
//   component: {
//     fan: {
//       enabled,
//       speed,
//     },
//   },
//   isHeating,
//   toggleFan,
//   disabled,
// }) => (
//   <div>
//     <Typography variant="h4" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
//       {speed.toFixed(1)}
//       %
//     </Typography>
//     <div style={{ marginTop: -3 }}>
//       <FormControlLabel
//         control={(
//           <Switch
//             checked={enabled}
//             onChange={toggleFan}
//             disabled={disabled}
//             aria-label="enable-fan"
//           />
//           )}
//         label="Enable Fan"
//       />
//     </div>
//   </div>
// )
//
// export default enhance(TemperatureSection)
