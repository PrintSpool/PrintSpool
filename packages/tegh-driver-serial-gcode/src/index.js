import serialMiddleware from './serial/middleware/serialMiddleware'

// exports
export reducer from './reducer'

export logReducer from './log/reducers/logReducer'

export const middleware = [serialMiddleware]
