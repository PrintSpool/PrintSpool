var stringResponseSize = function (offset, req, resp) {
  for (var i = offset + 3; i < resp.length; i++)
  {
    if (resp.readUInt8(i) == 0) return i + 1;
  }
  return Infinity;
};

var toolheadResponseSizes = {
   0: 0*1 + 1*2 + 0*4,
   2: 0*1 + 1*2 + 0*4,
  17: 0*1 + 0*2 + 1*4,
  22: 1*1 + 0*2 + 0*4,
  25: function (req) { req.readUInt8(5) },
  26: 1*1 + 0*2 + 0*4,
  30: 0*1 + 1*2 + 0*4,
  32: 0*1 + 1*2 + 0*4,
  33: 0*1 + 1*2 + 0*4,
  35: 1*1 + 0*2 + 0*4,
  36: 1*1 + 0*2 + 0*4,
  37: 0*1 + 6*2 + 0*4
};

module.exports = {
   0: 0*1 + 1*2 + 0*4,
   2: 0*1 + 1*2 + 0*4,
  10: function(req) {
    var size = toolheadResponseSizes[req.readUInt8(2)];
    return typeof(size) == "function" ? size(req) : size;
  },
  11: 1*1 + 0*2 + 0*4,
  12: function (req) { return req.readUInt8(3) },
  13: 1*1 + 0*2 + 0*4,
  14: 1*1 + 0*2 + 0*4,
  15: 0*1 + 0*2 + 1*4,
  16: 1*1 + 0*2 + 0*4,
  18: stringResponseSize.fill(1),
  20: stringResponseSize.fill(0),
  21: 0*1 + 1*2 + 5*4,
  22: 1*1 + 0*2 + 0*4,
  23: 1*1 + 0*2 + 0*4,
  24: 3*1 + 4*2 + 0*4,
  25: 0*1 + 0*2 + 5*4,
  27: 2*1 + 3*2 + 0*4
};
