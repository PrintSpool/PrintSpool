auth = require('authenticate-pam').authenticate

module.exports = (opts) ->
  opts.remoteHost ?= 'localhost'
  fn = (info, cb) -> verifyClient info, cb, opts
  fn.length = 2
  return fn

verifyClient = (info, cb, opts) =>
  # Fail fast if the basic auth is non-existant or invalid
  authHeader = info.req.headers.authorization
  return cb false unless authHeader? and authHeader.search('Basic ') == 0
  # Parsing the username and password
  b = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':')
  [user, pwd] = b
  # Authorizing using PAM
  _cb = (err) -> cb !err
  auth user, pwd, _cb, opts

