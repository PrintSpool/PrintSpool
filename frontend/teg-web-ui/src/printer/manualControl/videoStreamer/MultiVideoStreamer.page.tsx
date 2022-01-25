import React from 'react'
import VideoStreamerPage from './VideoStreamer.page'
import useStyles from './VideoStreamer.styles'

const MultiVideoStreamer = ({
  machineID,
  videos,
  iceServers,
}) => {
  const classes = useStyles()

  return (
    <>
    <div className={classes.container}>
      { videos.map((video) => (
        <VideoStreamerPage
          key={video.id}
          machineID={machineID}
          videoID={video.id}
          iceServers={iceServers}
        />
      ))}
    </div>
    </>
  )
}

export default MultiVideoStreamer
