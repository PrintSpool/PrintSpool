import React, { useEffect, useRef } from 'react'
import { gql, useQuery } from '@apollo/client'
import { useSnackbar } from 'notistack'

const LATENCY_QUERY = gql`
  query {
    ping
  }
`

const HIGH_LATENCY_THRESHOLD_MILLIS = 500
const HIDE_NOTIFICATION_AFTER_MILLIS = 5000
const PING_INTERVAL = 500

const LatencyNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const stateRef = useRef({
    show: false,
    showTimeout: null,
    closeTimeout: null,
  })

  const key = "latency_notification"

  const { data, error, previousData } = useQuery(LATENCY_QUERY, {
    pollInterval: PING_INTERVAL,
  })

  const show = () => {
    const state = stateRef.current

    if (state.closeTimeout != null) {
      clearTimeout(state.closeTimeout)
    }

    if (state.show) {
      console.log('continuing latency issues')
    }

    if (!state.show) {
      console.log('high latency')
    }

    stateRef.current = {
      show: true,
      showTimeout: null,
      closeTimeout: null,
    }

    enqueueSnackbar(
      'Connection interupted. 3D printer may receive commands after a delay or not at all',
      {
        key,
        variant: 'warning',
        persist: true,
        preventDuplicate: true,
      },
    )
  }

  const close = () => {
    if (stateRef.current.show) {
      console.log('latency issues resolved')
    }
    closeSnackbar(key)

    stateRef.current = {
      ...stateRef.current,
      show: false,
      closeTimeout: null,
    }
  }

  useEffect(() => (
    // Cleanup
    () => {
      console.log('Unmounting latency component')
      const { showTimeout } = stateRef.current
      if (showTimeout != null) {
        clearTimeout(showTimeout)
      }

      closeSnackbar(key)
    }
  ), [])

  const onFocus = () => {
    const { showTimeout, closeTimeout } = stateRef.current
    if (showTimeout != null) {
      clearTimeout(showTimeout)
    }

    if (closeTimeout != null) {
      clearTimeout(closeTimeout)
    }

    stateRef.current = {
      ...stateRef.current,
      showTimeout: setTimeout(show, PING_INTERVAL + HIGH_LATENCY_THRESHOLD_MILLIS),
      closeTimeout: null,
    }
  }

  useEffect(() => {
    const state = stateRef.current

    if (data) {
      // console.log(state.show, previousData)

      // aproximate round trip ping time by measuring the time between ping responses
      if (state.show && previousData) {
        const ping = Date.parse(data.ping) - Date.parse(previousData.ping) - PING_INTERVAL

        console.log(`ping: ${ping}ms`)
      }

      if (state.showTimeout != null) {
        clearTimeout(state.showTimeout)
      }

      let closeTimeout = state.closeTimeout
      if (!closeTimeout) {
        closeTimeout = setTimeout(close, HIDE_NOTIFICATION_AFTER_MILLIS)
      }

      stateRef.current = {
        ...state,
        showTimeout: setTimeout(show, PING_INTERVAL + HIGH_LATENCY_THRESHOLD_MILLIS),
        closeTimeout,
      }
    }
  }, [data])

  useEffect(() => {
    if (error) {
      console.error(error)
    }
  }, [error])


  useEffect(() => {
    console.log('Starting latency notifications')
    window.addEventListener('focus', onFocus)
    // window.addEventListener('blur', onBlur)
    // Specify how to clean up after this effect:
    return () => {
      window.removeEventListener('focus', onFocus)
      // window.removeEventListener('blur', onBlur)
    }
  }, [])

  return <></>
}

export default LatencyNotification
