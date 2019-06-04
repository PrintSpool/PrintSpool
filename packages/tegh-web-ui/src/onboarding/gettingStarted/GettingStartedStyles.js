import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
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
}), { withTheme: true })

export default useStyles
