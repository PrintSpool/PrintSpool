import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  root: {
    background: 'white',
    borderBottom: '1px solid #CCC',
    justifyContent: 'flex-end',
    display: 'flex',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  actionButton: {
    // color: 'white',
  },
}))

export default useStyles
