import React from 'react'
import {
  FlexibleWidthXYPlot,
  FlexibleXYPlot,
  HorizontalGridLines,
  LineSeries,
} from 'react-vis'

const TemperatureChart = ({
  data,
  materialTarget,
  horizontalGridLines = false,
  ticks = 2,
  className,
  xyPlotProps: xyPlotPropsOverride,
  flexibleHeight = true,
}) => {
  const xyPlotProps = {
    yDomain: [-0.2 * materialTarget, 1.2 * materialTarget],
    margin: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    ...xyPlotPropsOverride,
  }

  const XYPlot = flexibleHeight ? FlexibleXYPlot : FlexibleWidthXYPlot

  return (
    <div
      className={className}
    >
      <XYPlot
        {...xyPlotProps}
      >
        { horizontalGridLines && (
          <HorizontalGridLines
            tickValues={
              // eslint-disable-next-line prefer-spread
              Array.apply(null, Array(ticks))
                .map((entry, i) => materialTarget * i / (ticks - 1))
            }
          />
        )}
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

export default TemperatureChart
