import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  container: {
    // Using flex instead of grid for it's wrapping ability
    display: 'flex',
    flexDirection: 'row',
    // flexWrap: 'wrap',
    justifySelf: 'center',
    background: 'black',
    height: '35vh',
  },
  video: {
    flex: '1',
    // maxWidth: '100%',
    // width: '200px',
    // height: '200px',
    maxHeight: '35vh',
  },
}))

export default useStyles
