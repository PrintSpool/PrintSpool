import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  shareTitle: {
    textAlign: 'center',
  },
  shareWarning: {
    marginTop: theme.spacing(2),
  },
  qrCode: {
    textAlign: 'center',
    marginTop: theme.spacing(1),
  },
  inviteURLField: {
    fontSize: '0.8rem',
    lineHeight: '1rem',
  },
}), { withTheme: true })

export default useStyles
