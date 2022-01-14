import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  root: {
  },
  content: {
    marginLeft: theme.spacing(-4),
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(2),
  },
  donateButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      display: 'block',
      marginRight: 0,
      width: '100%',
      textAlign: 'left',
    },
  },
  donationButtonLogo: {
    marginRight: theme.spacing(1),
    display: 'inline-block',
    width: 30.85,
    marginBottom: '-0.1em',
    height: '0.9em',
  },
  nanoLogo: {
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginBottom: '-0.3em',
    },
  },
  ethereumLogo: {
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginBottom: '-0.3em',
    },
  },
  animationGridItem: {
    // display: 'grid',
    // alignItems: 'center',
  },
  animation: {
    maxWidth: '100%',
    [theme.breakpoints.down('lg')]: {
      width: '100%',
    },
  },
}))

export default useStyles
