// NOTE: still copying code out of this into tegh-driver-serial-gcode
// Delete after copying.

/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let AbstractSerialDriver;
const { EventEmitter } = require('events');
const serialport = require("serialport");
const { SerialPort } = serialport;
const { spawn } = require('child_process');
const ArudinoDiscoverer = require("../arduino_discoverer");

const SerialInterface = class AbstractSerialDriver extends EventEmitter {
  static initClass() {
    this.prototype._comments = /;[^\n]*|\([^\n]*\)/g;

    this.prototype._opened = false;
    // TODO: This should be more abstractly whether the printer is ready to print or not
    this.prototype._headersReceived = false;
    // The previous line is set to null after an acknowledgment ("ok") is received
    this.prototype._previousLine = null;
    this.prototype._nextLineNumber = 1;
    // The gcode is set to either an array of gcode lines if printing or null otherwise
    this.prototype._printJob = null;
    this.prototype._printJobLine = 0;
    // Gcodes added via the sendNow function (like temperature polling)
    this.prototype._sendNowQueue = [];
    // An array of extruders and beds that the printer is waiting for to reach temp
    this.prototype._blockers = [];

    this.prototype.verbose = false;
    this.prototype.waitForHeaders = true;
    this.prototype.pollingInterval = 700;
  }

  constructor(opts, SP) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { this; }).toString();
      let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
      eval(`${thisName} = this;`);
    }
    this.reset = this.reset.bind(this);
    this._cliReset = this._cliReset.bind(this);
    this._onOpen = this._onOpen.bind(this);
    this._onError = this._onError.bind(this);
    this._onSeriousError = this._onSeriousError.bind(this);
    this._onSerialDisconnect = this._onSerialDisconnect.bind(this);
    this._receivePollResponse = this._receivePollResponse.bind(this);
    this.sendNow = this.sendNow.bind(this);
    this.print = this.print.bind(this);
    if (opts == null) { opts = {}; }
    if (SP == null) { SP = SerialPort; }
    this.opts = Object.merge((this._defaultOpts||{}), opts);
    if (!this.verbose) { this.verbose = this.opts.verbose; }
    this._comName = this.opts.port.comName;
    this._baudrate = this.opts.driver.baudrate || this.opts.baudrate;
    if (this.verbose) { console.log(this._baudrate); }
    this.serialPort = new SP(this._comName, {
      baudrate: this._baudrate,
      parser: this._serialParser,
      flowControl: true
    }).on("data", this._onData)
    .on("open", this._onOpen)
    .on("error", this._onError);
    this.serialPort.options.errorCallback = this._onSeriousError;
    if (this.polling = this.opts.polling) { this.startPolling(); }
    ArudinoDiscoverer.on('disconnect', this._onSerialDisconnect);
  }

  reset() {
    this._cliReset();
    this._printJob = null;
    this._printJobLine = 0;
    return this._headersReceived = false;
  }

  _cliReset() {
    const args = [this._comName, this._baudrate];
    const proc = spawn(`${__dirname}/../../bin/arduino_reset`, args);
    proc.stdout.on('data', data => { if (this.verbose) { return console.log(`stdout: ${data}`); } });
    proc.stderr.on('data', data => { if (this.verbose) { return console.log(`stderr: ${data}`); } });
    return proc.on('close', code => {
      if (this.verbose) { return console.log(`reset exited with code ${code}`); }
    });
  }

  _onOpen() {
    this._opened = true;
    if (this.verbose) { console.log("opened"); }
    this._cliReset();
    return this._headersReceived = (this.waitForHeaders === false);
  }

  _onError(err) {
    if (this.verbose) { return console.log(err); }
  }

  _onSeriousError(err) {
    if (this.verbose) { console.log(err); }
    return this.emit('disconnect');
  }

  _onSerialDisconnect(p) {
    if (this._killed || (p.comName !== this._comName)) { return; }
    this.emit('disconnect');
    return this.kill();
  }

  startPolling() {
    this.on("change", this._receivePollResponse);
    return this._poll();
  }

  _receivePollResponse(data) {
    if ((this._lastPoll == null) || Object.values(data).none(d => d.current_temp != null)) { return; }
    if (this._blockers.length > 0) { return; }
    const nextPollTime = Math.max(0, (this._lastPoll + this.pollingInterval) - Date.now());
    this._lastPoll = null;
    // Requesting a temperature update from the printer in nextPollTime ms
    return this._pollingTimeout = setTimeout(this._poll, nextPollTime);
  }

  kill() {
    if (this._killed) { return; }
    this._killed = true;
    if (this.verbose) { console.log("Killing the print driver"); }
    if (this._pollingTimeout != null) { clearTimeout(this._pollingTimeout); }
    ArudinoDiscoverer.removeListener('disconnect', this._onSerialDisconnect);
    this.removeAllListeners();
    return this.serialPort.close(() => this.serialPort.removeAllListeners());
  }

  sendNow(gcodes, prep) {
    if (prep == null) { prep = true; }
    if (prep === true) { gcodes = this._prepGCodes(gcodes); }
    this._sendNowQueue = this._sendNowQueue.concat(gcodes);
    if (this.isClearToSend()) { return this._sendNextLine(); }
  }

  print(printJob) {
    this._printJobLine = 0;
    this._printJob = this._prepGCodes(printJob);
    if (this.isClearToSend()) { return this._sendNextLine(); }
  }

  _prepGCodes(gcode) {
    if (typeof(gcode) === "array") {
      gcode = gcode.map(function(s) { return s.remove(this._comments); });
    } else if (typeof(gcode) === "string") {
      gcode = gcode.remove(this._comments).split('\n');
    } else {
      throw "gcode must either be an array of string or a string";
    }
    // creating an array of lines without comments, whitespace or empy lines
    return gcode.map(s=> s.compact()).compact(true);
  }

  _sendNextLine() {
    let line, printJobLine;
    if (this._sendNowQueue.length > 0) {
      line = this._sendNowQueue.shift();
    } else if (this.isPrinting() && !this._isComplete()) {
      line = this._printJob[this._printJobLine];
      this._printJobLine++;
      printJobLine = true;
    } else {
      return;
    }
    this._send(line, this._nextLineNumber);
    this._emitSendEvents(line);

    // Rate limited print job line events (1 per 100ms)
    const now = Date.now();
    if ((printJobLine == null) || !((this._lastPrintLineEvent || 0) < (now - 100))) { return; }
    this._lastPrintLineEvent = now;
    this._lastPrintLineEvent;
    return this.emit("print_job_line_sent");
  }

  _jobCompletionCheck() {
    if (!this.isPrinting() || !this._isComplete()) { return; }
    this.emit("print_complete", this._printJob);
    return this._printJob = null;
  }

  isClearToSend() {
    return (this._previousLine == null) && this._headersReceived;
  }

  isPrinting() { return (this._printJob != null) && this._headersReceived; }

  _isComplete() { return (this._printJob == null) || (this._printJobLine === this._printJob.length); }
};

export default SerialInterface
