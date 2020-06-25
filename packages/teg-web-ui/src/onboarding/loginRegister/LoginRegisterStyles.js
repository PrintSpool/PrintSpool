import { makeStyles } from '@material-ui/core/styles'

import googleIcon from './google.png'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    // gridTemplateRows: 'auto 1fr',
    gridTemplateRows: '1fr',
    minHeight: '100vh',
  },
  // navigation: {
  //   justifySelf: 'stretch',
  // },
  form: {
    justifySelf: 'center',
    alignSelf: 'center',
    maxWidth: 400,
    marginBottom: 100,
  },
  header: {
    background: '#DD25C4',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  tabContent: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  passwordLoginButton: {
    marginTop: theme.spacing(2),
  },
  or: {
    textAlign: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  googleIcon: {
    display: 'inline-block',
    width: 24,
    height: 24,
    marginRight: theme.spacing(1),
    backgroundImage: `url(${googleIcon})`,
    backgroundSize: 24,
    backgroundRepeat: 'no-repeat',
  }
}))

export default useStyles
