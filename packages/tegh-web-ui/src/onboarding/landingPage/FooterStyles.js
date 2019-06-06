import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  gradient: {
    display: 'grid',
    background: 'linear-gradient(#DD25C4, #9602A7)',
    gridTemplateColumns: '10% [logo] 20% 30% [logoAdjacent] auto',
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '5% [logo] 25% 5% [logoAdjacent] auto',
    },
  },
  logo: {
    gridArea: 'logo',
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
    background: '#3D3D3D',
    color: '#fff',
    gridTemplateColumns: '[left] auto [right] 33%',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  navigationRight: {
    gridArea: 'right',
    justifySelf: 'right',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(8),
  },
  connectTitle: {
    color: '#fff',
  },
  freenode: {
    color: '#fff',
    textDecoration: 'underline',
  },
}), { withTheme: true })

export default useStyles
