import { makeStyles } from '@material-ui/core/styles'

const CUBES_BOTTOM_WHITESPACE = '20px'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateRows: 'max-content auto max-content',
    alignItems: 'center',
    background: 'linear-gradient(#DD25C4, #9602A7)',
    backgroundSize: '100% 90%',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    // height: `calc(100vh - 10vw - ${CUBES_BOTTOM_WHITESPACE})`,
    // marginBottom: `calc(10vw + ${CUBES_BOTTOM_WHITESPACE})`,
    width: '100%',
  },
  topButtons: {
    // display: 'block',
    display: 'grid',
    justifySelf: 'right',
    gridTemplateColumns: 'auto auto',
    marginTop: theme.spacing(4),
    marginLeft: theme.spacing(6),
    marginRight: theme.spacing(6),
  },
  topButton: {
    display: 'block',
    color: 'white',
    marginLeft: theme.spacing(2),
  },
  centeredContent: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      paddingTop: '10vh',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    [theme.breakpoints.up('sm')]: {
      // marginBottom: theme.spacing(14)
      // marginTop: `calc(- 10vw - ${CUBES_BOTTOM_WHITESPACE})`,
    },
    // [theme.breakpoints.up('lg')]: {
    //   marginTop: `calc(-45vw - 50px - ${CUBES_BOTTOM_WHITESPACE})`,
    // },
  },
  rightSide: {
    alignSelf: 'center',
  },
  logo: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    [theme.breakpoints.down('xs')]: {
      height: '30vh',
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: '40vw',
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
      marginRight: 32,
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
    [theme.breakpoints.only('xs')]: {
      marginTop: '5vh',
      marginBottom: '5vh',
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
    // marginTop: `calc(-10vw - ${CUBES_BOTTOM_WHITESPACE})`,
    overflow: 'hidden',
    [theme.breakpoints.up('lg')]: {
      display: 'flex',
      alignItems: 'center',
      // marginTop: '-100px',
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
}))

export default useStyles
