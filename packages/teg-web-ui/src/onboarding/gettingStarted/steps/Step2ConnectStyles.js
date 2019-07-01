import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    textAlign: 'center',
  },
  qrCodeContainer: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 400,
  },
  qrCode: {
    width: '100%',
  },
}), { withTheme: true })

export default useStyles
