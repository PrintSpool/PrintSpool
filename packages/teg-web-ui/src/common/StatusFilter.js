import React from 'react'
import {
  Typography,
} from '@material-ui/core'
import Loader from 'react-loader-advanced'

const StatusFilter = ({
  only = null,
  not = null,
  status,
  children,
  title,
  lighten = false,
}) => {
  const show = (
    (only && only.includes(status) === false)
    || (not && not.includes(status) === true)
  )

  return (
    <Loader
      show={show}
      message={(
        <Typography
          variant={lighten ? 'h5' : 'h4'}
          style={{ color: lighten ? '#222' : '#fff' }}
        >
          {title(status)}
        </Typography>
      )}
      style={show ? {
        flex: 1,
        margin: 12,
      } : {}}
      backgroundStyle={{
        backgroundColor: (
          lighten ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
        ),
      }}
      contentStyle={{
        display: 'flex',
        flexWrap: 'wrap',
      }}
    >
      {children}
    </Loader>
  )
}

export default StatusFilter
