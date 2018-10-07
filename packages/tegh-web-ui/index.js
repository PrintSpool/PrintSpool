import '@babel/polyfill'
import path from 'path'
import serve from 'koa-static'

export const serverHook = (params) => {
  const dev = process.env.NODE_ENV !== 'production'
  if (dev) return
  const root = path.join(__dirname, 'out')
  params.koaApp.use(serve(root))
}
