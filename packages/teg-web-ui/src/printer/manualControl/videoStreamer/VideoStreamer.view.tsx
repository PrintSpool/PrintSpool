import React from 'react'
import LoadingOverlay from '../../../common/LoadingOverlay'
import useStyles from './VideoStreamer.styles'

const VideoStreamerView = ({
  videoEl,
  isLoading,
}) => {
  const classes = useStyles()

  return (
    // <LoadingOverlay loading={isLoading} loadingText="">
    <video
      ref={videoEl}
      className={classes.video}
      controls={!isLoading}
      autoPlay
    >
    </video>
    // {/* </LoadingOverlay> */}
  )
}

export default VideoStreamerView
