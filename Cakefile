path = require('path')
sys = require('sys')
glob = require('glob')
fs = require('fs-extra')
require("sugar")

stdout = process.stdout
_spawn = require('child_process').spawn
_execSync = require('exec-sync')

# verbose spawn (with callbacks as well)
spawn = (cmd, options = {}, cb) ->
  args = options.args || []
  delete options.args
  console.log cmd
  console.log "#{cmd} #{args.map((s) -> "\"#{s}\"").join(' ')}"
  proc = _spawn cmd, args, options

  printStream = (stream) ->
    proc[stream].on 'data', (data) -> stdout.write data

  printStream(stream) for stream in ['stdout', 'stderr']

  proc.on "exit", cb if cb?
  return proc

# verbose execSync
execSync = (cmd) -> console.log _execSync(cmd)


packageHelp = "Package tegh-daemon for ubuntu, fedora, brew (osx) and arch"
distroHelp = 'Package only the specific distro [arch|fedora|ubuntu]'
option '-d', '--distro [DISTRIBUTION]', distroHelp

task "package", packageHelp, (opts) ->
  console.log opts.distro
  if opts.distro
    distros = [opts.distro]
  else
    distros = ['osx','fedora', 'ubuntu', 'arch']

  buildDir = path.resolve(__dirname, "build")
  packageDir =  path.resolve __dirname, "bin", "packages"
  fs.removeSync packageDir
  fs.mkdirSync packageDir

  # # OSX
  # if distros.indexOf('osx') != -1
  #   VERSION = "0.2.0"
  #   brew_tar_path = path.resolve(packageDir, "tegh-#{VERSION}-brew.tar.gz")
  #   console.log brew_tar_path
  #   cmd = "tar -cvzf '#{brew_tar_path}'"
  #   cmd += " --include='doc' --include='bin' --include='src'"
  #   cmd += " --include='LICENSE' --include='node_modules'"
  #   cmd += " --exclude='bin/packages'"
  #   cmd += " ./*"
  #   console.log cmd
  #   sha1 = false
  #   _onData = (error, stdout, stderr) ->
  #     console.log('stdout: ' + stdout)
  #     console.log('stderr: ' + stderr)
  #     console.log('exec error: ' + error) if (error != null)
  #     if sha1 == false
  #       sha1 = true
  #       exec("openssl sha1 #{brew_tar_path}", _onData)
  #   proc = exec cmd, cwd: __dirname, maxBuffer: 10*1024*1024, _onData

  # # Fedora
  # if distros.indexOf('fedora') != -1
  #   FedoraBuild = require "./build/fedora.coffee"
  #   new FedoraBuild().run()

  # # Ubuntu
  # if distros.indexOf('ubuntu') != -1
  #   spawn path.resolve(buildDir, "ubuntu.sh"), cwd: buildDir
  #   debFile = glob.sync(path.resolve buildDir, "tegh-*.deb")[0]
  #   fs.copy debFile, path.resolve(packageDir, path.basename debFile)

  # Arch
  if distros.indexOf('arch') != -1
    spawn "tar",
      args: ['-cvzf', path.resolve(packageDir, 'tegh-daemon-git.tar.gz'), 'tegh-daemon-git']
      cwd: path.resolve(buildDir, 'arch-src')
