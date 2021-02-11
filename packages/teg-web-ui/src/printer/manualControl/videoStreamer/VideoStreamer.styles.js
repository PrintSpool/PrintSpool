import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    background: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
}))

export default useStyles
