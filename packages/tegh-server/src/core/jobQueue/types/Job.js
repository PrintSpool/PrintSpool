// @flow
import uuid from 'uuid/v4'
import { Record, List } from 'immutable'
import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'
import { JobStatusGraphQLEnum } from './JobStatus'
import { default as JobFile, JobFileGraphQLType} from './JobFile'

import type { RecordOf, List as ListType } from 'immutable'
import type { JobFileT } from './JobFile'

export type JobT = RecordOf<{
  id: string,
  name: string,
  files: ListType<JobFileT>,
  createdAt: ?number,
}>

const JobRecord = Record({
  id: null,
  name: null,
  files: List(),
  createdAt: null,
})

const Job = attrs => JobRecord({
  ...attrs,
  id: uuid(),
  createdAt: new Date().toISOString(),
  files: List(attrs.files.map(JobFile)),
})

export const JobGraphQLType = new GraphQLObjectType({
  name: 'Job',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    name: {
      type: tql`String!`,
    },
    files: {
      type: tql`[${JobFileGraphQLType}!]!`,
    },
    createdAt: {
      type: tql`String!`,
    },
    startedAt: {
      type: tql`String!`,
    },
    stoppedAt: {
      type: tql`String!`,
    },
    // status: {
    //   type: tql`${JobStatusGraphQLEnum}!`,
    // },
  })
})

export default Job
