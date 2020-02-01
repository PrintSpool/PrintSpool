import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  buttonClass: {
    color: 'white',
  },
  menu: {
    minWidth: theme.spacing(16 * 3),
  },
  largeAvatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(2),
  },
  largeName: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
    fontSize: '1.4rem',
  },
  email: {
    textAlign: 'center',
    marginBottom: theme.spacing(2),
    fontSize: '1rem',
  },
}), { withTheme: true })

export default useStyles
