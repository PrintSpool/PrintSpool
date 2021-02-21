import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  useEffect,
} from 'react'
import { gql, useApolloClient } from '@apollo/client'
import Typography from '@material-ui/core/Typography'
import { useAsync } from 'react-async'
import SimplePeer from 'simple-peer'

import { TegApolloContext } from '../../../webrtc/TegApolloProvider'
import ErrorFallback from '../../../common/ErrorFallback'
import { INSECURE_LOCAL_CONNECTION } from '../../../webrtc/WebRTCLink'
import VideoStreamerView from './VideoStreamer.view'

const createVideoSDPMutation = gql`
  mutation createVideoSDPMutation($input: CreateVideoSDPInput!) {
    createVideoSDP(input: $input) {
      id
      answer {
        type
        sdp
      }
      iceCandidates {
        candidate
        sdpMLineIndex
        sdpMid
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

const VideoStreamerPage = (props: any) => {
  const {
    machineID,
    videoID,
  } = props

  const apollo = useApolloClient()
  const { iceServers } = useContext(TegApolloContext)

  const videoEl = useRef(null)
  const MAX_RETRY_DELAY = 5000
  const [retryDelay, setRetryDelay] = useState(500)
  const [peerError, setPeerError] = useState()

  if (INSECURE_LOCAL_CONNECTION) {
    return (
      <Typography variant="body2">
        Video only available over secure connections
      </Typography>
    )
  }

  const loadVideo = useCallback(async () => {
    console.log('Starting Video Streamer')

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
        input: {
          machineID,
          videoID,
          offer,
        }
      },
    })

    console.log('answer', data.createVideoSDP.answer)
    p.signal(data.createVideoSDP.answer)

    console.log('createVideoSDP ice candidates', data.createVideoSDP.iceCandidates)

    data.createVideoSDP.iceCandidates.forEach((candidate) => {
      p.signal({ candidate })
    })

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

    console.log("wait for stream???")
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

  // console.log({ error, isLoading })

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
    <VideoStreamerView {...nextProps} />
  )
}

export default VideoStreamerPage
