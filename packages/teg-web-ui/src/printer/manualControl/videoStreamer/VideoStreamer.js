import React, { useState, useRef, useCallback, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useAsync } from 'react-async'

import { useApolloClient } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import SimplePeer from 'simple-peer'

import { TegApolloContext } from '../../../TegApolloProvider'
import LoadingOverlay from '../../../common/LoadingOverlay'

const createVideoSDPMutation = gql`
  mutation createVideoSDPMutation($offer: RTCSessionDescriptionInput!) {
    createVideoSDP(offer: $offer) {
      type
      sdp
    }
  }
`

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    background: 'black',
  },
  video: {
    width: '100%',
    maxHeight: '40vh',
  },
}))

const enhance = Component => (props) => {
  const apollo = useApolloClient()
  const { iceServers } = useContext(TegApolloContext)

  const videoEl = useRef(null)
  const [peerError, setPeerError] = useState()

  const loadVideo = useCallback(async () => {
    const mediaConstraints = {
      offerToReceiveAudio: false,
      offerToReceiveVideo: true,
    }

    const p = new SimplePeer({
      initiator: true,
      trickle: false,
      offerOptions: mediaConstraints,
      config: { iceServers },
    })

    p.on('error', err => setPeerError(err))

    const offer = await new Promise(resolve => p.on('signal', resolve))
    // console.log('offer', offer)

    const { data } = await apollo.mutate({
      mutation: createVideoSDPMutation,
      variables: {
        offer,
      },
    })

    // console.log('answer', data.createVideoSDP)
    p.signal(data.createVideoSDP)

    p.on('connect', () => {
      console.log('CONNECT')
    })

    const stream = await new Promise(resolve => p.on('stream', resolve))
    console.log({ stream })

    // got remote video stream, now let's show it in a video tag
    if ('srcObject' in videoEl.current) {
      videoEl.current.srcObject = stream
    } else {
      videoEl.current.src = window.URL.createObjectURL(stream) // for older browsers
    }

    videoEl.current.play()
  }, [])

  const { isLoading, error } = useAsync({
    promiseFn: loadVideo,
  })

  if (error || peerError) {
    throw error || peerError
  }

  const nextProps = {
    ...props,
    videoEl,
    isLoading,
  }

  return (
    <Component {...nextProps} />
  )
}

const VideoStreamer = ({
  videoEl,
  isLoading,
}) => {
  const classes = useStyles()

  return (
    <LoadingOverlay loading={isLoading}>
      <div className={classes.container}>
        <video
          ref={videoEl}
          className={classes.video}
        >
        </video>
      </div>
    </LoadingOverlay>
  )
}

export const Component = VideoStreamer
export default enhance(VideoStreamer)
