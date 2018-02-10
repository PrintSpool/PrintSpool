var path = require('path')
var koaStatic = require('koa-static')

module.exports = {
  webHook: function(params) {
    var root = path.join(__dirname, '.next')
    params.koaApp.koaApp.use(koaStatic(root))
  }
}
