require('coffee-script/register');

var factory = require("../factory.coffee");
var driver = null;
var events = [
  'ready', 'change', 'printer_error', 'print_complete', 'print_job_line_sent'
];

process.once('message', function (opts) {
  opts.driver.fork_child_process = false;
  driver = factory.build(opts);
  process.on('message', onMessage);
  
  for (var i in events)
  {
    addEventListener(events[i]);
  }
});

var addEventListener = function (k) {
  driver.on(k, function (data) {onEvent(k, data)});
};

var onMessage = function (msg) {
  // console.log msg
  driver[msg.fn].apply(driver, msg.args)
};

onEvent = function (event, data) {
  try
  {
    process.send({event: event, data: data});
  }
  catch(e)
  {
    console.log("Child Process unable to send events. Killing driver.");
    console.log(e);
    process.exit();
  }
};

process.send({event: "child_process_initialize"});
