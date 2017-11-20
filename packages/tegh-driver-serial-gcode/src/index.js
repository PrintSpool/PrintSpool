import config from './config.js'
import reducer from './reducer.js'
import rxMiddleware from './rx_middleware.js'
import txMiddleware from './tx_middleware.js'

export config
export reducer
export middlewares = [rxMiddleware, txMiddleware]
