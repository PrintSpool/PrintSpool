import React from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import ButtonGroup from '@mui/material/ButtonGroup'
import FormGroup from '@mui/material/FormGroup'

import useExecGCodes from '../../_hooks/useExecGCodes'

const Home = ({
  machine,
}) => {
  const home = axes => useExecGCodes(() => ({
    machine,
    gcodes: [
      { home: { axes } },
    ],
  }))

  return (
    <FormGroup row style={{
      marginBottom: 16,
    }}>
        <Typography
          variant="body1"
          style={{
            alignSelf: 'center',
            marginRight: 8,
          }}
        >
          Home
        </Typography>
        <ButtonGroup aria-label="home">
          <Button
              onClick={home('all')}
            >
            All
          </Button>
          <Button
            onClick={home(['x', 'y'])}
          >
            {'X&Y'}
          </Button>
          <Button
            onClick={home(['x'])}
          >
            X
          </Button>
          <Button
            onClick={home(['y'])}
          >
            Y
          </Button>
          <Button
            onClick={home(['z'])}
          >
            Z
          </Button>
        </ButtonGroup>
    </FormGroup>
  )
}

export default Home
