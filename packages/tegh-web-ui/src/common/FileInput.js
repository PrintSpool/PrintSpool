import React, { useCallback } from 'react'
import FileInputStyles from './FileInputStyles'

const FileInput = ({
  onClick,
  ...props
}) => {
  const classes = FileInputStyles()

  const onHTMLInputChange = useCallback((e) => {
    e.preventDefault()
    // convert files to an array
    const files = [...e.target.files]
    onClick(files)
  }, [onClick])

  return (
    <input
      type="file"
      value=""
      className={classes.root}
      onChange={onHTMLInputChange}
      {...props}
    />
  )
}

export default FileInput
