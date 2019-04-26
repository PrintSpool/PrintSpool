import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    gridTemplateColumns: 'min-content max-content 1fr',
    gridTemplateRows: 'auto',
    alignItems: 'center',
    // background: 'linear-gradient(#DD25C4, #9602A7)',
    background: '#DD25C4',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  logo: {
    height: 50,
    marginRight: 15,
  },
  title: {
    color: 'white',
  },
  actions: {
    justifySelf: 'end',
  },
  buttonClass: {
    color: 'white',
  },
}), { withTheme: true })

export default useStyles
