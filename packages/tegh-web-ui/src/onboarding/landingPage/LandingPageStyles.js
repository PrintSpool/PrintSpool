import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
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
