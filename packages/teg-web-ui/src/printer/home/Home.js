import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useGraphQL } from 'graphql-react'

import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Divider,
} from '@material-ui/core'

import WithAuth0Token from '../../common/auth/WithAuth0Token'
import userProfileServerFetchOptions from '../../common/userProfileServer/fetchOptions'

import HomeStyles from './HomeStyles'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'
import PrintButton from '../printButton/PrintButton'

const Home = ({
  auth0Token,
}) => {
  const classes = HomeStyles()

  const { loading, cacheValue = {} } = useGraphQL({
    fetchOptionsOverride: userProfileServerFetchOptions(auth0Token),
    operation: {
      query: `
        {
          my {
            machines {
              id
              publicKey
              name
              slug
            }
          }
        }
      `
    },

    // Load the query whenever the component mounts. This is desirable for
    // queries to display content, but not for on demand situations like
    // pagination view more buttons or forms that submit mutations.
    loadOnMount: true,

    // Reload the query whenever a global cache reload is signaled.
    loadOnReload: true,

    // Reload the query whenever the global cache is reset. Resets immediately
    // delete the cache and are mostly only used when logging out the user.
    loadOnReset: true,
  })
  console.log({ loading, cacheValue })

  // const navActions = ({ buttonClass }) => (
  //   <>
  //     <Button
  //       className={buttonClass}
  //       component={React.forwardRef((props, ref) => (
  //         <Link
  //           to="/get-started"
  //           className={classes.manage}
  //           innerRef={ref}
  //           {...props}
  //         />
  //       ))}
  //     >
  //       Add Printer
  //     </Button>
  //   </>
  // )

  if (loading) {
    return <div />
  }

  const error = !loading && (
    cacheValue.fetchError || cacheValue.httpError || cacheValue.graphQLErrors
  )

  if (error) {
    return (
      <div>
        <Typography variant="h6" paragraph>
          Something went wrong. Here's what we know:
        </Typography>
        <pre>
          {JSON.stringify(cacheValue, null, 2)}
        </pre>
      </div>
    )
  }

  if (cacheValue.data == null) {
    return <div />
  }

  const machines = Object.values(cacheValue.data.my.machines)

  return (
    <React.Fragment>
      <StaticTopNavigation
        title={() => 'Teg'}
      />

      <div className={classes.root}>
        <div className={classes.header}>
          <Button
            size="small"
            component={React.forwardRef((props, ref) => (
              <Link
                to="/get-started"
                innerRef={ref}
                {...props}
              />
            ))}
          >
            Add a Printer
          </Button>
          <Typography variant="subtitle2" component="h1">
            3D Printers
          </Typography>
        </div>

        <List>
          { machines.map(machine => (
            <ListItem key={machine.slug}>
              <ListItemText primary={machine.name} />
              <ListItemSecondaryAction>
                <Button
                  className={classes.manage}
                  component={React.forwardRef((props, ref) => (
                    <Link
                      to={`/q/${machine.slug}/`}
                      className={classes.manage}
                      innerRef={ref}
                      {...props}
                    />
                  ))}
                >
                  Manage
                </Button>
                <PrintButton href={`/print/?q=${machine.slug}`} />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        { machines.length === 0 && (
          <div className={classes.emptyListMessage}>
            <Typography variant="h6" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
              It looks like you don't have any 3D printers setup yet.
            </Typography>
            <Button
              className={classes.addFirstPrinterButton}
              variant="contained"
              color="primary"
              component={React.forwardRef((props, ref) => (
                <Link
                  to="/get-started"
                  innerRef={ref}
                  {...props}
                />
              ))}
            >
              Add your first printer
            </Button>
          </div>
        )}
      </div>
    </React.Fragment>
  )
}

export default WithAuth0Token(Home)
