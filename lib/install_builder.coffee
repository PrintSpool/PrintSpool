fs = require("fs-extra")

# Builds a series of file operation steps via a simple DSL and then executes 
# them asynchronously in series. Commands can be added via the context and run 
# via the run function.
module.exports = class InstallBuilder
  constructor: (@srcDir, @destDir) ->
    @_cmds = [ ['mkdirp', ''] ]
    @_context = {}
    @_context[k] = @add.fill k for k in ['install', 'mv']

  add: (args...) =>
    @_cmds.push args

  run: (installer, @callback) =>
    installer.call @_context
    @_done()

  _done: =>
    return @callback?() if @_cmds.length == 0
    cmd = @_cmds.shift()
    # console.log "command"
    # console.log cmd
    @[cmd[0]].apply(@, cmd[1..])

  install: (file) ->
    # console.log "install #{"#{@srcDir}/#{file}"} #{"#{@destDir}/#{file}"}"
    fs.copy "#{@srcDir}/#{file}", "#{@destDir}/#{file}", @_done

  mv: (f1, f2) ->
    fs.rename "#{@destDir}/#{f1}", "#{@destDir}/#{f2}", @_done

  mkdirp: (dir) ->
    fs.mkdirp "#{@destDir}/#{dir}", @_done