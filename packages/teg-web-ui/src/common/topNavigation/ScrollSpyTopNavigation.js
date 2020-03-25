import React from 'react'

import useWindowScroll from '@react-hook/window-scroll'
import useWindowSize from '@react-hook/window-size'
import { animated } from 'react-spring'

import tegLogoNoTextSVG from 'url:./images/tegLogoNoText.svg'

const TopNavigation = () => {
  // const [props, set, stop] = useSpring(() => ({ opacity: 0 }))
  const windowSize = useWindowSize()
  const scrollY = useWindowScroll(60)

  // console.log({ position, windowSize})

  return (
    <animated.div
      style={{
        position: 'static',
        display: scrollY >= windowSize.height ? 'block' : 'none',
        // height: 50,
      }}
    >
      <img
        alt="Teg"
        src={tegLogoNoTextSVG}
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
        { /*
          <button>
            Get Started
          </button>
        */ }
      </div>
    </animated.div>
  )
}

export default TopNavigation
