import React from 'react'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import FormGroup from '@material-ui/core/FormGroup'

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
