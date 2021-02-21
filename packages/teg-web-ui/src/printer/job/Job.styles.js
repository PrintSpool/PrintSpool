import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    overflow: 'scroll',
  },
  card: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  videoStreamer: {
    // display: 'grid',
    // alignContent: 'center',
    // overflow: 'hidden',
    // maxHeight: '35vh',
    // width: '100%',

    marginBottom: theme.spacing(2),
    display: 'grid',
    alignContent: 'center',
    overflow: 'hidden',

    // Vertical Split
    maxHeight: '35vh',

  },
  viewingUsersButton: {
    float: 'right',
  },
}))

export default useStyles
