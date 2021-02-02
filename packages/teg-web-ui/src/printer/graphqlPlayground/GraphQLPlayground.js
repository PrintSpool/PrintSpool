import React, { useCallback } from 'react'

import { useApolloClient } from '@apollo/client'
import { Provider } from 'react-redux'
import { Playground, store } from 'graphql-playground-react'

import GraphQLPlaygroundStyles from './GraphQLPlaygroundStyles'

const GraphQLPlayground = () => {
  const classes = GraphQLPlaygroundStyles()
  const { link } = useApolloClient()

  const createLink = useCallback(() => ({ link }))

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
