import tql from 'typiql'
import {
  GraphQLObjectType,
} from 'graphql'

import JobGraphQL from './Job.graphql.js'

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
      type: tql`[${JobGraphQL}!]!`,
      args: {
        id: {
          type: tql`ID`,
        },
      },
      resolve(source, { id }) {
        const { jobQueue } = source
        if (id != null) {
          const job = jobQueue.jobs.get(id)
          return [job]
        }
        const jobs = jobQueue.jobs.toList().sortBy(job => job.createdAt)
        return jobs
      },
    },
  }),
})

export default JobQueueGraphQL
