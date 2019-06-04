import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
  },
  donateButton: {
    marginRight: theme.spacing.unit * 2,
  },
  donationButtonLogo: {
    height: '1em',
    marginRight: theme.spacing.unit,
  },
}), { withTheme: true })

export default useStyles
