import React, { useContext, useCallback } from 'react'

import { Provider } from 'react-redux'
import { Playground, store } from 'graphql-playground-react'

import { UserDataContext } from '../../UserDataProvider'
import { createTegApolloLink } from '../../TegApolloProvider'

import GraphQLPlaygroundStyles from './GraphQLPlaygroundStyles'

const GraphQLPlayground = ({
  match: { params: { hostID } },
}) => {
  const classes = GraphQLPlaygroundStyles()

  const { hosts } = useContext(UserDataContext)

  const hostIdentity = hosts[hostID].invite
  // endpoint={`teg://${hostID}`}

  const createLink = useCallback(() => ({
    link: createTegApolloLink({ hostIdentity }),
  }))

  return (
    <Provider
      store={store}
      style={{ width: '100%' }}
    >
      <div className={classes.root}>
        <Playground
          endpoint="teg://"
          fixedEndpoint
          createApolloLink={createLink}
          settings={{
            'editor.theme': 'light',
          }}
        />
      </div>
    </Provider>
  )
}

export default GraphQLPlayground
