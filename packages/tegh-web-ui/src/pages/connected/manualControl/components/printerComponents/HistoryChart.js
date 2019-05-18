import React from 'react'
import {
  FlexibleWidthXYPlot,
  FlexibleXYPlot,
  HorizontalGridLines,
  LineSeries,
} from 'react-vis'

const HistoryChart = ({
  data,
  materialTarget,
  isToolhead,
}) => {
  const xyPlotProps = {
    yDomain: [-0.2 * materialTarget, 1.2 * materialTarget],
    height: isToolhead ? 80 : 120,
    margin: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  }

  const XYPlot = isToolhead ? FlexibleWidthXYPlot : FlexibleXYPlot

  return (
    <div
      style={{
        marginTop: isToolhead ? 8 : 0,
        marginBottom: isToolhead ? -8 : 0,
        width: '100%',
      }}
    >
      <XYPlot
        {...xyPlotProps}
      >
        <HorizontalGridLines tickValues={[0, materialTarget]} />
        <LineSeries
          data={data.map(entry => ({
            x: new Date(entry.createdAt).getTime(),
            y: entry.currentTemperature,
          }))}
          curve="curveMonotoneX"
          opacity={1}
          strokeStyle="solid"
          style={{}}
        />

        <LineSeries
          data={data.map(entry => ({
            x: new Date(entry.createdAt).getTime(),
            y: entry.targetTemperature,
          }))}
          curve="curveMonotoneX"
          opacity={1}
          strokeStyle="solid"
          style={{}}
        />
      </XYPlot>
    </div>
  )
}

export default HistoryChart
