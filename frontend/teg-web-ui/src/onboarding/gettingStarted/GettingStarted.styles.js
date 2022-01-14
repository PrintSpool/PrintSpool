import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    minHeight: '100vh',
    paddingBottom: '1.0rem',
  },
  stepper: {
    marginTop: '1.5rem',
  },
  content: {
    marginTop: '1rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 50,
    paddingRight: 50,
  },
  buttons: {
    marginLeft: 'auto',
    paddingLeft: 50,
    paddingRight: 50,
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  content: {
    margin: theme.spacing(4),
    justifyContent: 'center',
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
