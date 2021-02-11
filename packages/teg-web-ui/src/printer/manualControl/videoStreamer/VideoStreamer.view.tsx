import React from 'react'
import LoadingOverlay from '../../../common/LoadingOverlay'
import useStyles from './VideoStreamer.styles'

const VideoStreamerView = ({
  videoEl,
  isLoading,
}) => {
  const classes = useStyles()

  return (
    <LoadingOverlay loading={false}>
      <div className={classes.container}>
        {/* eslint-disable-next-line */}
        <video
          ref={videoEl}
          className={classes.video}
          controls
          autoPlay
        >
        </video>
      </div>
    </LoadingOverlay>
  )
}

export default VideoStreamerView
