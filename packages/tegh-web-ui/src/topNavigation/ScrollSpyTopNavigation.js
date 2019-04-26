import React from 'react'

import useWindowScrollPosition from '@rehooks/window-scroll-position'
import useWindowSize from '@rehooks/window-size'
import { useSpring, animated } from 'react-spring'

import teghLogoNoTextSVG from './images/teghLogoNoText.svg'

const TopNavigation = () => {
  const [props, set, stop] = useSpring(() => ({ opacity: 0 }))

  const windowSize = useWindowSize()
  const position = useWindowScrollPosition({
    throttle: 100,
  })

  console.log({ position, windowSize})

  return (
    <animated.div
      style={{
        position: 'static',
        display: position.y >= windowSize.innerHeight ? 'block' : 'none',
        // height: 50,
      }}
    >
      <img
        alt="Tegh"
        src={teghLogoNoTextSVG}
        style={{
          height: 50,
        }}
      />
      <div
        style={{
          float: 'right',
        }}
      >
        Get Involved
        <button>
          Get Started
        </button>
      </div>
    </animated.div>
  )
}

export default TopNavigation
