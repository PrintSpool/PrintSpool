import makeStyles from '@mui/styles/makeStyles';
import cubesSVG from 'url:./images/cubes.svg'

const CUBES_BOTTOM_WHITESPACE = '20px'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateRows: 'max-content auto max-content',
    alignItems: 'center',
    background: 'linear-gradient(#DD25C4, #9602A7)',
    backgroundSize: '100% calc(100vh - 5vw)',
    backgroundRepeat: 'no-repeat',
    minHeight: 'calc(100vh + 10vw)',
    // height: `calc(100vh - 10vw - ${CUBES_BOTTOM_WHITESPACE})`,
    // marginBottom: `calc(10vw + ${CUBES_BOTTOM_WHITESPACE})`,
    width: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column-reverse',
    },
  },
  wordmark: {
    flex: 1,
    fontSize: 50,
    [theme.breakpoints.down('sm')]: {
      fontSize: 30,
    },
    color: 'white',
    letterSpacing: 2,
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
  },
  topButtons: {
    // display: 'block',
    display: 'grid',
    justifySelf: 'right',
    gridTemplateColumns: 'auto auto',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      alignSelf: 'end',
      marginRight: theme.spacing(2),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
  },
  topButton: {
    display: 'block',
    color: 'white',
    marginLeft: theme.spacing(2),
  },
  centeredContent: {
    display: 'flex',
    justifyContent: 'center',
    // marginTop: theme.spacing(3),
    // marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: '100%',
    alignItems: 'center',
    backgroundImage: `url(${cubesSVG})`,
    backgroundSize: '100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'bottom',
    paddingBottom: 'calc(10vw)',
    minHeight: 'calc(100vh + 10vw)',
  },
  rightSide: {
    alignSelf: 'center',
  },
  taglinePart1: {
    color: 'white',
    fontSize: '2.7rem',
    [theme.breakpoints.down('md')]: {
      fontSize: '1.8rem',
    },
  },
  callToActionButton: {
    marginTop: theme.spacing(3),
    // marginTop: '3vh',
    // [theme.breakpoints.only('xs')]: {
    //   marginTop: '5vh',
    //   marginBottom: '5vh',
    // },
    // [theme.breakpoints.up('sm')]: {
    //   position: 'absolute',
    //   bottom: 35,
    // },
    // [theme.breakpoints.only('sm')]: {
    //   bottom: 25,
    // },
  },
  // cubes: {
  //   width: '100%',
  //   // marginTop: `calc(-10vw - ${CUBES_BOTTOM_WHITESPACE})`,
  //   overflow: 'hidden',
  //   [theme.breakpoints.up('lg')]: {
  //     display: 'flex',
  //     alignItems: 'center',
  //     // marginTop: '-100px',
  //   },
  // },
  // firstInnerCubes: {
  //   flex: 2,
  // },
  // secondInnerCubes: {
  //   flex: 1,
  //   transform: 'scaleX(-1)',
  //   marginLeft: -2,
  //   marginRight: -2,
  // },
}))

export default useStyles
