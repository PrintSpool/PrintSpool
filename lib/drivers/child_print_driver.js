require('coffee-script');

var factory = require("../print_driver_factory.coffee");
var driver = null;
var events = ['ready', 'change', 'printer_error'];

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
  process.send({event: event, data: data});
};

process.send({event: "child_process_initialize"});
