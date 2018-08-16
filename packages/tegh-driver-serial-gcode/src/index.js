import serialMiddleware from './serial/middleware/serialMiddleware'

// exports
export Settings from './config/types/Settings'

export logReducer from './log/reducers/logReducer'

export reducer from './reducer'

export const middleware = [serialMiddleware]
