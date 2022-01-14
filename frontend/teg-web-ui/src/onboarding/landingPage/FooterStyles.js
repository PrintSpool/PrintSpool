import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  gradient: {
    display: 'grid',
    background: 'linear-gradient(#DD25C4, #9602A7)',
    gridTemplateColumns: '10% [logo] 20% 30% [logoAdjacent] auto',
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),

    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '[logoAdjacent] auto',
    },
  },
  logo: {
    gridArea: 'logo',
    width: '100%',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  logoAdjacent: {
    gridArea: 'logoAdjacent',
    justifySelf: 'center',
    alignSelf: 'center',
  },
  callToActionButton: {
  },
  navigation: {
    display: 'grid',
    gridTemplateColumns: '[left] auto [right] 33%',

    background: '#3D3D3D',
    color: '#fff',

    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),

    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '[right] max-content',
      fontSize: '1rem',
    },

    '& a': {
      color: '#fff',
      textDecoration: 'underline',
    },
  },
  navigationLeft: {
    gridArea: 'left',
  },
  navigationRight: {
    gridArea: 'right',
    justifySelf: 'right',
  },
}))

export default useStyles
