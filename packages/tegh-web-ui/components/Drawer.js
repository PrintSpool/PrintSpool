import {
  Drawer as MaterialUIDrawer,
  withStyles,
  Hidden,
  Divider,
  List,
  ListItem,
  ListItemText,
} from 'material-ui'

const drawerWidth = 240;

const styles = theme => ({
  root: {
    width: '100%',
    height: 430,
    marginTop: theme.spacing.unit * 3,
    zIndex: 1,
    overflow: 'hidden',
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  appBar: {
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  drawerHeader: theme.mixins.toolbar,
  drawerPaper: {
    width: 250,
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      position: 'relative',
      height: '100%',
    },
  },
  content: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    padding: theme.spacing.unit * 3,
    height: 'calc(100% - 56px)',
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64,
    },
  },
})

const DrawerContents = ({ classes }) => (
  <div>
    <div className={classes.drawerHeader} />
    <Divider />
    <List>
      <ListItem button>
        {/*
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
        */}
        <ListItemText primary="Inbox" />
      </ListItem>
    </List>
    <Divider />
    <ListItem button>
      {/*
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
      */}
      <ListItemText primary="Inbox2" />
    </ListItem>
  </div>
)

const Drawer = ({
  mobileOpen = true,
  handleDrawerToggle = () => null,
  classes,
  theme,
}) => (
  <div>
    <Hidden mdUp>
      <MaterialUIDrawer
        type="temporary"
        anchor={'left'}
        open={mobileOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        <DrawerContents classes={classes} />
      </MaterialUIDrawer>
    </Hidden>
    <Hidden smDown implementation="css">
      <MaterialUIDrawer
        type="permanent"
        open
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <DrawerContents classes={classes} />
      </MaterialUIDrawer>
    </Hidden>
  </div>
)

export default withStyles(styles, { withTheme: true })(Drawer)
