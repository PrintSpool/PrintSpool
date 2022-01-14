import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  root: {
    overflowY: 'scroll',
  },
  title: {
    paddingTop: theme.spacing(3),
  },
  addFab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(2),
    zIndex: 10,
  },
}))

export default useStyles
