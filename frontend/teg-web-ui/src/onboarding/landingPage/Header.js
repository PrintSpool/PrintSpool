import React from 'react'

import Typography from '@mui/material/Typography'

import HeaderStyles from './HeaderStyles'

const GreenHeader = ({ title, variant, name }) => {
  const classes = HeaderStyles()

  return (
    <>
      { name && (
        /* eslint-disable-next-line */
        <a name={name} />
      )}
      <Typography
        variant="h4"
        paragraph
        component="div"
        className={[
          classes.root,
          classes[`${variant}Root`],
        ].join(' ')}
      >
        <div
          className={[
            classes.path,
            classes[`${variant}Path`],
          ].join(' ')}
        />
        <div className={classes.title}>
          {title}
        </div>
      </Typography>
    </>
  )
}

export default GreenHeader
