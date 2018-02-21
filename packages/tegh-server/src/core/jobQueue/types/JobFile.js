// @flow
import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'
import uuid from 'uuid/v4'
import { Record, List } from 'immutable'

import type { RecordOf, List as ListType } from 'immutable'

export type JobFileT = RecordOf<{
  name: string,
  path: string,
  isTempFile: boolean,
  quantity: number,
}>

const JobFileRecord = Record({
  id: null,
  name: null,
  path: null,
  isTempFile: null,
  quantity: null,
})

const JobFile = attrs => JobFileRecord({
  ...attrs,
  id: uuid(),
  status: 'queued',
})

export const JobFileGraphQLType = new GraphQLObjectType({
  name: 'JobFile',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    name: {
      type: tql`String!`,
    },
    quantity: {
      type: tql`Int!`,
    },
    // status: {
    //   type: tql`${JobStatusGraphQLEnum}!`,
    // },
  })
})

export default JobFile
