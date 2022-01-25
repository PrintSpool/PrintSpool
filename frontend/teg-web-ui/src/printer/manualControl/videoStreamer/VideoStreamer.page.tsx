import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react'
import { gql, useApolloClient } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { useAsync } from 'react-async-hook'
import SimplePeer from 'simple-peer'

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
    $videoSessionID: ID!
  ) {
    iceCandidates(videoSessionID: $videoSessionID) {
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
    iceServers,
  } = props

  const apollo = useApolloClient()

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

  const loadVideo = useCallback(async ({ reset = false } = {}) => {
    // console.log('Starting Video Streamer')

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

    console.log('breakpoint!')

    const offer = await new Promise(resolve => p.on('signal', resolve))
    // console.log('offer', offer)

    const { data } = await apollo.mutate({
      mutation: createVideoSDPMutation,
      variables: {
        input: {
          machineID,
          videoID,
          offer,
          reset,
        }
      },
    })

    // console.log(data)

    // console.log('answer', data.createVideoSDP.answer)
    p.signal(data.createVideoSDP.answer)

    // console.log('createVideoSDP ice candidates', data.createVideoSDP.iceCandidates)

    data.createVideoSDP.iceCandidates.forEach((candidate) => {
      p.signal({ candidate })
    })

    const updateIceCandidates = async () => {
      // console.log(`querying ice candidates (session id: ${data.createVideoSDP.id})`)

      const { data: { iceCandidates } } = await apollo.query({
        query: queryIceCandidates,
        variables: {
          videoSessionID: data.createVideoSDP.id,
        },
      })

      // console.log({ iceCandidates })

      iceCandidates.forEach((candidate) => {
        p.signal({ candidate })
      })
    }
    const iceCandidatePollingInterval = setInterval(updateIceCandidates, 300)

    p.on('connect', () => {
      // console.log(`video connected (session id: ${data.createVideoSDP.id})`)
      clearInterval(iceCandidatePollingInterval)
    })

    // p.on('iceStateChange', (iceConnectionState, iceGatheringState) => {
    //   console.log('ICE:', iceConnectionState, iceGatheringState)
    //
    //   if (iceConnectionState === 'completed') {
    //     clearInterval(iceCandidatePollingInterval)
    //   }
    // })

    // Wait for stream. Timeout is here because some times webrtc streamer fails to start a stream.
    let stream
    let streamTimeout
    try {
      stream = await new Promise((resolve, reject) => {
        p.on('stream', resolve)
        streamTimeout = setTimeout(() => reject(new Error('Starting stream timed out')), 1000)
      })
    } catch (e) {
      setPeerError(e)
      return
    }
    clearTimeout(streamTimeout)
    // console.log(`video streaming (session id: ${data.createVideoSDP.id})`)

    // got remote video stream, now let's show it in a video tag
    if ('srcObject' in videoEl.current) {
      videoEl.current.srcObject = stream
    } else {
      // @ts-ignore
      videoEl.current.src = window.URL.createObjectURL(stream) // for older browsers
    }

    try {
      videoEl.current.play()
    } catch (e) {
      console.warn('Unable to autoplay video')
    }
  }, [])

  // Load the video stream on startup
  const { loading, error, execute: reload } = useAsync(loadVideo, [])

  // console.log({ error, isLoading })

  const lastRetryAt = useRef(null as any)
  const retryTimeout = useRef(null as any)

  // Re-try the video stream after a delay if there is a connection error
  useEffect(() => {
    if ((error ?? peerError) == null || retryTimeout.current != null) return () => {}

    // Reset the server if this is the second reconnect attempt in less then 5 seconds
    const reset = lastRetryAt.current != null && lastRetryAt.current + 5_000 > Date.now();

    console.error(
      `Video Streaming Error (retrying in ${retryDelay}ms)`,
      (peerError as any)?.message || peerError
    )

    retryTimeout.current = setTimeout(() => {
      console.log('Retrying video connection')
      lastRetryAt.current = Date.now()
      retryTimeout.current = null

      reload({ reset })
    }, retryDelay)

    setPeerError(null)
    setRetryDelay(Math.min(retryDelay * 1.5, MAX_RETRY_DELAY))
  }, [error, peerError])

  // Clear the retry timeout only on unmount
  useEffect(() => () => clearTimeout(retryTimeout.current), [])

  if (error) {
    return (
      <ErrorFallback error={error} />
    )
  }

  const nextProps = {
    ...props,
    videoEl,
    isLoading: loading || peerError,
  }

  return (
    <VideoStreamerView {...nextProps} />
  )
}

export default VideoStreamerPage
