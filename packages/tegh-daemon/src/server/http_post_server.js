import koa from 'koa'
import koaRouter from 'koa-router'
import koaBody from 'koa-bodyparser'
import cors from 'koa-cors'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import { apolloUploadKoa } from 'apollo-upload-server'

const httpPostServer = (teghServerConfig) => {
  // eslint-disable-next-line new-cap
  const app = new koa()
  app.use(cors())
  // eslint-disable-next-line new-cap
  const router = new koaRouter()
  const PORT = 3900

  const {
    context,
    schema,
  } = teghServerConfig

  const teghGraphqlKoa = () => graphqlKoa({
    context,
    schema,
  })

  // koaBody is needed just for POST.
  router.post(
    '/graphql',
    koaBody(),
    apolloUploadKoa(),
    teghGraphqlKoa()
  )

  router.get('/graphql', teghGraphqlKoa())

  router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))

  app.use(router.routes())
  app.use(router.allowedMethods())
  // eslint-disable-next-line no-console
  app.listen(PORT, () => { console.log(`Tegh is listening on ${PORT}`) })
}

export default httpPostServer
