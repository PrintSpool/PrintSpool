import tql from 'typiql'
import {
  GraphQLObjectType,
} from 'graphql'

import JobGraphQL from './Job.graphql'

const JobQueueGraphQL = new GraphQLObjectType({
  name: 'JobQueue',
  fields: () => ({
    id: {
      type: tql`ID!`,
      resolve(source) {
        return source.config.id
      },
    },
    name: {
      type: tql`String!`,
      resolve(source) {
        return source.config.name
      },
    },
    jobs: {
      type: tql`[${JobGraphQL}]!`,
      resolve(source) {
        const { jobQueue } = source
        const jobs = jobQueue.jobs.toList()
        return jobs
      },
    },
  }),
})

export default JobQueueGraphQL
