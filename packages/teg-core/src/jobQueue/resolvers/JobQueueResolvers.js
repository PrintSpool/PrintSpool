import getPluginModels from '../../config/selectors/getPluginModels'

const JobQueueResolvers = {
  JobQueue: {
    id: source => source.config.host.id,
    // TODO: multimachine job queue name
    name: source => getPluginModels(source.config.printer).getIn(['@tegapp/core', 'name']),
    // name: source => source.config.host.name,
    jobs: (source, { id }) => {
      const { jobQueue } = source
      if (id != null) {
        const job = jobQueue.jobs.get(id)
        return [job]
      }
      const jobs = jobQueue.jobs.toList().sortBy(job => job.createdAt)
      return jobs
    },
  },
}

export default JobQueueResolvers
