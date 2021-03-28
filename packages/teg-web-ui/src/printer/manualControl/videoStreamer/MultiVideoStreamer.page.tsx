import React from 'react'
import VideoStreamerPage from './VideoStreamer.page'
import useStyles from './VideoStreamer.styles'

const MultiVideoStreamer = ({
  machineID,
  videos
}) => {
  const classes = useStyles()

  return (
    <>
    <div className={classes.container}>
      {/* { [videos[0]].map((video) => ( */}
      { videos.map((video) => (
        <VideoStreamerPage
          key={video.id}
          machineID={machineID}
          videoID={video.id}
        />
      ))}
    </div>
    </>
  )
}

export default MultiVideoStreamer
