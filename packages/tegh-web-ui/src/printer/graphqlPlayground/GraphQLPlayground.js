import React, { useContext, useCallback } from 'react'

import { Provider } from 'react-redux'
import { Playground, store } from 'graphql-playground-react'

import { UserDataContext } from '../../UserDataProvider'
import { createTeghApolloLink } from '../common/frame/higherOrderComponents/TeghApolloProvider'

import GraphQLPlaygroundStyles from './GraphQLPlaygroundStyles'

const GraphQLPlayground = ({
  match: { params: { hostID } },
}) => {
  const classes = GraphQLPlaygroundStyles()

  const { hosts } = useContext(UserDataContext)

  const hostIdentity = hosts[hostID].invite
  // endpoint={`tegh://${hostID}`}

  const createLink = useCallback(() => ({
    link: createTeghApolloLink({ hostIdentity }),
  }))

  return (
    <Provider
      store={store}
      style={{ width: '100%' }}
    >
      <div className={classes.root}>
        <Playground
          endpoint="tegh://"
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
