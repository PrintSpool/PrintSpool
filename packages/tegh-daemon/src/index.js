import koa from 'koa'
import koaRouter from 'koa-router'
import koaBody from 'koa-bodyparser'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import teghSchema from './graphql/schema.js'

const app = new koa()
const router = new koaRouter()
const PORT = 3000

// koaBody is needed just for POST.
router.post('/graphql', koaBody(), graphqlKoa({ schema: teghSchema }))
router.get('/graphql', graphqlKoa({ schema: teghSchema }))

router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(PORT, () => {console.log(`Tegh is listening on ${PORT}`)})
