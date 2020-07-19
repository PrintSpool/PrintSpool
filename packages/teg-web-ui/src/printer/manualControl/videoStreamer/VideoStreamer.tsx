import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  useEffect,
} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useAsync } from 'react-async'

import { useApolloClient } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import SimplePeer from 'simple-peer'

import { TegApolloContext } from '../../../TegApolloProvider'
import LoadingOverlay from '../../../common/LoadingOverlay'
import ErrorFallback from '../../../common/ErrorFallback'

const createVideoSDPMutation = gql`
  mutation createVideoSDPMutation($offer: RTCSignalInput!) {
    createVideoSDP(offer: $offer) {
      id
      answer {
        type
        sdp
      }
    }
  }
`

const queryIceCandidates = gql`
  query(
    $id: ID!
  ) {
    iceCandidates(id: $id) {
      candidate
      sdpMLineIndex
      sdpMid
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
    height: '100%',
  },
}))

const enhance = (Component: any) => (props: any) => {
  const apollo = useApolloClient()
  const { iceServers } = useContext(TegApolloContext)

  const videoEl = useRef(null)
  const MAX_RETRY_DELAY = 5000
  const [retryDelay, setRetryDelay] = useState(500)
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

    console.log('answer', data.createVideoSDP.answer)
    p.signal(data.createVideoSDP.answer)

    const updateIceCandidates = async () => {
      console.log('querying ice candidates')

      const { data: { iceCandidates } } = await apollo.query({
        query: queryIceCandidates,
        variables: {
          id: data.createVideoSDP.id,
        },
      })

      console.log({ iceCandidates })

      iceCandidates.forEach((candidate) => {
        p.signal({ candidate })
      })
    }
    const iceCandidatePollingInterval = setInterval(updateIceCandidates, 300)

    console.log("WAT")
    p.on('connect', () => {
      console.log('CONNECT')
      clearInterval(iceCandidatePollingInterval)
    })

    // p.on('iceStateChange', (iceConnectionState, iceGatheringState) => {
    //   console.log('ICE:', iceConnectionState, iceGatheringState)
    //
    //   if (iceConnectionState === 'completed') {
    //     clearInterval(iceCandidatePollingInterval)
    //   }
    // })

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

  const { isLoading, error, run: runLoadVideo } = useAsync({
    deferFn: loadVideo,
  })

  console.log({ error, isLoading })

  // Load the video stream on startup
  useEffect(() => {
    runLoadVideo()
  }, [])

  // Re-try the video stream after a delay if there is a connection error
  useEffect(() => {
    if (peerError == null) return () => {}

    console.error('Video Streaming Error', peerError)

    const timeout = setTimeout(runLoadVideo, retryDelay)

    setPeerError(null)
    setRetryDelay(Math.min(retryDelay * 1.5, MAX_RETRY_DELAY))

    return () => clearTimeout(timeout)
  }, [peerError])

  if (error) {
    return (
      <ErrorFallback error={error} />
    )
  }

  const nextProps = {
    ...props,
    videoEl,
    isLoading: isLoading || peerError,
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
        {/* eslint-disable-next-line */}
        <video
          ref={videoEl}
          className={classes.video}
          controls
        >
        </video>
      </div>
    </LoadingOverlay>
  )
}

export const Component = VideoStreamer
export default enhance(VideoStreamer)
