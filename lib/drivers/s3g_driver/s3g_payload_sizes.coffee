
`
// These sizes do not include the command byte (that's added next)
var payloadSizes = {
    0: 0*1 + 1*2 + 0*4,
    1: 0*1 + 0*2 + 0*4,
   12: 1*1 + 1*2 + 0*4,
   13: 1*1 + 1*2 + 0*4,
   14: 1*1 + 0*2 + 0*4,
   16: 1*1 + 0*2 + 0*4,
   18: 1*1 + 0*2 + 0*4,
   22: 1*1 + 0*2 + 0*4,
   24: 1*1 + 0*2 + 0*4,
   27: 0*1 + 1*2 + 0*4,
  131: 1*1 + 1*2 + 1*4,
  132: 1*1 + 1*2 + 1*4,
  133: 0*1 + 0*2 + 1*4,
  134: 1*1 + 0*2 + 0*4,
  135: 1*1 + 2*2 + 0*4,
  137: 1*1 + 0*2 + 0*4,
  139: 0*1 + 0*2 + 6*4,
  140: 0*1 + 0*2 + 5*4,
  141: 1*1 + 2*2 + 0*4,
  142: 1*1 + 0*2 + 6*4,
  143: 1*1 + 0*2 + 0*4,
  144: 1*1 + 0*2 + 0*4,
  145: 2*1 + 0*2 + 0*4,
  146: 5*1 + 0*2 + 0*4,
  147: 1*1 + 2*2 + 0*4,
  148: 2*1 + 1*2 + 0*4,
  149: 5*1 + 0*2 + 0*4,
  150: 2*1 + 0*2 + 0*4,
  151: 1*1 + 0*2 + 0*4,
  152: 1*1 + 0*2 + 0*4,
  153: 1*1 + 0*2 + 1*4,
  154: 1*1 + 0*2 + 0*4,
  155: 1*1 + 1*2 + 6*4,
  157: 3*1 + 1*2 + 1*4
};

// These sizes do not include the command bytes or tool id (that's added next)
var toolPayloadSizes = {
    0: 0*1 + 1*2 + 0*4,
    2: 0*1 + 0*2 + 0*4,
    3: 0*1 + 1*2 + 0*4,
    6: 0*1 + 0*2 + 1*4,
   10: 1*1 + 0*2 + 0*4,
   12: 1*1 + 0*2 + 0*4,
   13: 1*1 + 0*2 + 0*4,
   14: 1*1 + 0*2 + 0*4,
   25: 1*1 + 1*2 + 0*4,
   26: 1*1 + 1*2 + 0*4,
   30: 0*1 + 0*2 + 0*4,
   31: 0*1 + 1*2 + 0*4
};
`

# Adding command bytes and tool id bytes to the payload sizes
payloadSizes[k] += 1 for k, v of payloadSizes
toolPayloadSizes[k] += 3 for k, v of toolPayloadSizes

module.exports =
  payloadSizes: payloadSizes,
  toolPayloadSizes: toolPayloadSizes
