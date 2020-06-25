import { makeStyles } from '@material-ui/core/styles'

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
    lineHeight: `${theme.spacing(12)}px`,
    textAlign: 'center',
    fontSize: '48px',
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
}))

export default useStyles
