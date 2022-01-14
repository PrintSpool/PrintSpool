import makeStyles from '@mui/styles/makeStyles';

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
}))

export default useStyles
