import { makeStyles } from '@material-ui/styles'

const CUBES_BOTTOM_WHITESPACE = '20px'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(#DD25C4, #9602A7)',
    height: `calc(100vh - 10vw - ${CUBES_BOTTOM_WHITESPACE})`,
    // marginBottom: `calc(10vw + ${CUBES_BOTTOM_WHITESPACE})`,
    width: '100%',
  },
  centeredContent: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      paddingTop: '10vh',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    // [theme.breakpoints.up('sm')]: {
    //   marginTop: `calc(- 10vw - ${CUBES_BOTTOM_WHITESPACE})`,
    // },
    // [theme.breakpoints.up('lg')]: {
    //   marginTop: `calc(-45vw - 50px - ${CUBES_BOTTOM_WHITESPACE})`,
    // },
  },
  logo: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    [theme.breakpoints.down('xs')]: {
      marginTop: -100,
      height: '30vh',
    },
    [theme.breakpoints.only('sm')]: {
      height: '35vh',
    },
    [theme.breakpoints.up('md')]: {
      height: '35vh',
    },
  },
  taglines: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
      marginTop: '5vh',
    },
    [theme.breakpoints.up('sm')]: {
      marginRight: 100,
      marginTop: 30,
    },
    [theme.breakpoints.only('sm')]: {
      marginLeft: '5vw',
    },
  },
  taglinePart1: {
    color: 'white',
    fontSize: '2.7rem',
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: '2.4rem',
    },
    [theme.breakpoints.only('sm')]: {
      fontSize: '2.5rem',
    },
  },
  taglinePart2: {
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: '300',
    marginTop: 10,
    [theme.breakpoints.only('md', 'lg')]: {
      marginTop: 15,
      fontSize: '1.5rem',
    },
  },
  callToActionButton: {
    marginTop: '3vh',
    [theme.breakpoints.down('xs')]: {
      marginTop: '5vh',
    },
    // [theme.breakpoints.up('sm')]: {
    //   position: 'absolute',
    //   bottom: 35,
    // },
    // [theme.breakpoints.only('sm')]: {
    //   bottom: 25,
    // },
  },
  cubes: {
    width: '100%',
    marginTop: `calc(-10vw - ${CUBES_BOTTOM_WHITESPACE})`,
    overflow: 'hidden',
    [theme.breakpoints.up('lg')]: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '-100px',
    },
  },
  firstInnerCubes: {
    flex: 2,
  },
  secondInnerCubes: {
    flex: 1,
    transform: 'scaleX(-1)',
    marginLeft: -2,
    marginRight: -2,
  },
}), { withTheme: true })

export default useStyles
