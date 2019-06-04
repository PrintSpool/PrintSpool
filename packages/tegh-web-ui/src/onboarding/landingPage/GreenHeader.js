import React from 'react'

import {
  Typography,
} from '@material-ui/core'

import greenPathSVG from './images/greenPath.svg'

const GreenHeader = ({ title }) => (
  <Typography
    variant="h4"
    paragraph
    style={{
      color: 'white',
      marginTop: 80,
      marginBottom: 50,
      paddingLeft: 'auto',
      paddingRight: 'auto',
      background: '#05CB0D',
      lineHeight: '116px',
      textAlign: 'center',
      textTransform: 'uppercase',
      fontSize: '3rem',
      fontWeight: 100,
    }}
  >
    <span
      style={{
        float: 'right',
        width: 86,
        height: 156,
      }}
    />
    <span
      style={{
        backgroundColor: '#fafafa',
        backgroundImage: `url(${greenPathSVG})`,
        backgroundSize: 'cover',
        float: 'left',
        width: 86,
        height: 156,
      }}
    />
    {title}
  </Typography>
)

export default GreenHeader
