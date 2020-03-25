import React from 'react'

import {
  Typography,
} from '@material-ui/core'

import orangePathSVG from 'url:./images/orangePath.svg'

const OrangeHeader = ({ title }) => (
  <Typography
    variant="h4"
    paragraph
    style={{
      color: 'white',
      // paddingLeft: 86,
      marginTop: 80,
      marginBottom: 50,
      paddingLeft: 'auto',
      paddingRight: 'auto',
      background: '#FF7A00',
      lineHeight: '116px',
      textAlign: 'center',
      textTransform: 'uppercase',
      fontSize: '3rem',
      fontWeight: 100,
    }}
  >
    <span
      style={{
        backgroundColor: '#fafafa',
        backgroundImage: `url(${orangePathSVG})`,
        backgroundSize: 'cover',
        backgroundPositionX: 'right',
        float: 'right',
        width: 86,
        height: 156,
        marginTop: -40,
      }}
    />
    <span
      style={{
        float: 'left',
        width: 86,
        height: 156,
      }}
    />
    {title}
  </Typography>
)

export default OrangeHeader
