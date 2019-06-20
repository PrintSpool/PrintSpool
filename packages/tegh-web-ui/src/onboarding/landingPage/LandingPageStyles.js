import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
  },
  content: {
    marginLeft: theme.spacing(-4),
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(4),

    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(-2),
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(2),
    },
  },
  donateButton: {
    marginRight: theme.spacing(2),
  },
  donationButtonLogo: {
    height: '1em',
    marginRight: theme.spacing(1),
  },
  animationGridItem: {
    display: 'grid',
    alignItems: 'center',
  },
  animation: {
    maxWidth: '100%',
  },
}), { withTheme: true })

export default useStyles
