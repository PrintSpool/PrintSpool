const parser = (originalLine) => {
  const { verbose, serialPort, greetingReceived } = state
  if (verbose) console.log(`${serialPort.path} received: ${action.data}`)
  const line = action.data.toLowerCase()
  if (line.startsWith("debug_")) return state
  if (!greetingReceived && line.has(GREETINGS)) {
    // TODO: ASYNC
    nextState._readyTimeoutID = setTimeout(() => {
      store.dispatch({
        type: 'PRINTER_READY',
      })
    }, DELAY_FROM_GREETING_TO_READY)
  } else if (line.startsWith('echo:')) {
    return state
  } else if (line.startsWith('ok')) {
    nextState.previousLine = null
    // TODO: IO
    sendNextLine()
    jobCompletionCheck()
  } else if (line.startsWith('resend') || line.startsWith('rs')) {
    const lineNumber = parseInt(line.split(/N:|N|:/)[1])
    // TODO: IO
    this._send(state.previousLine, lineNumber)
  }
  // if (!line.startsWith("echo:")) this._emitReceiveEvents(line, originalLine)
  // Parse a line of gcode response from the printer and emit printer errors and
  // current_temp, target_temp_countown and blocking changes
  let k;
  let data = {};
  // console.log l
  // Parsing temperatures
  if (l.has("t:")) {
    // Filtering out non-temperature values
    let temps = l.remove(/(\/|[a-z]*@:|e:)[0-9\.]*|ok/g);
    // Normalizing the input
    temps = temps.replace("t:", "e0:").replace(/:[\s\t]*/g, ':');
    // Adds a temperature to a object of { KEY: {current_temp: VALUE}, ... }
    const addToHash = function(h, t) { h[t[0]] = {current_temp: parseFloat(t[1])}; return h; };
    // Construct that obj containing key-mapped current temps
    data = temps.words()
    .map( s=> s.split(":"))
    .filter( t=> (t[0].length > 0) && !isNaN(parseFloat(t[1])))
    .reduce(addToHash, {});
  }
  // Parsing "w" temperature countdown values
  // see: http://git.io/FEACGw or google "TEMP_RESIDENCY_TIME"
  const w = parseFloat(data.w != null ? data.w.current_temp : undefined)*1000;
  delete data['w'];
  if ((w != null) && !isNaN(w)) {
    for (k of Array.from(this._blockers)) { (data[k] != null ? data[k] : (data[k] = {})).target_temp_countdown = w; }
  }
  // Parsing ok's and removing blockers
  if (l.has("ok")) {
    for (k of Array.from(this._blockers)) { (data[k] != null ? data[k] : (data[k] = {})).blocking = false; }
    this._blockers = [];
  }
  // Fire the current temperature and target temp countdown changes
  // console.log data
  if (data != null) { this.emit("change", data); }
  // TODO: DISPATCH ACTION?
  if (l.startsWith('error')) { return this.emit("printer_error", originalLine); }

}
