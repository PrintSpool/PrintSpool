import { effects, utils } from 'redux-saga'
const { call, put, take, takeEvery, takeLatest, select } = effects

import forkLatest from './forkLatest'

const testPut = { type: 'TEST_PUT' }
const testTake = { type: 'TEST_TAKE' }

test('creates a fork for each action', () => {
  const pattern = 'TEST_PATTERN'
  const saga = function*() {}
  const gen = forkLatest(pattern, saga).CALL.fn()
  let task

  // 1st loop
  task = gen.next()
  expect(task.value.TAKE.pattern).toBe(pattern)
  task = gen.next({type: pattern})
  expect(task.value.FORK.fn).toBe(saga)
  // 2nd loop
  task = gen.next(utils.createMockTask())
  expect(task.value.TAKE.pattern).toBe(pattern)
  task = gen.next({type: pattern})
  expect(task.value.CANCEL).not.toBe(null)
  task = gen.next()
  expect(task.value.FORK.fn).toBe(saga)
})
