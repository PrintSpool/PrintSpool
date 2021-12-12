import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    textAlign: 'center',
  },
  intro: {
    // marginTop: '1rem',
  },
  codeInstruction: {
    // marginTop: '0.5rem',
  },
  code: {
    display: 'block',
    background: '#333',
    color: 'white',
    borderRadius: '0.4rem',
    padding: '0.6rem',
    paddingLeft: '0.8rem',
    paddingRight: '0.8rem',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '1.0rem',
  },
  dontHaveRaspberryPi: {
    // marginTop: '1rem',
  },
  alreadyHaveTeg: {
    marginTop: '2rem',
  },
}))

export default useStyles
