import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100vh',
    display: 'grid',
    // alignItems: 'center',
    // justifyItems: 'center',
    gridTemplateRows: 'auto 1fr',
  },
  center: {
    alignSelf: 'center',
    justifySelf: 'center',
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
  },
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}))

export default useStyles
