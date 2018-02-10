var path = require('path')
var serve = require('koa-static')

module.exports = {
  serverHook: function(params) {
    var root = path.join(__dirname, 'out')
    params.koaApp.use(serve(root))
  }
}
