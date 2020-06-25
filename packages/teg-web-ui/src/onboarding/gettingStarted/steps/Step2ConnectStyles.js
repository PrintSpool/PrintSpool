import { makeStyles } from '@material-ui/core/styles'

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
}))

export default useStyles
