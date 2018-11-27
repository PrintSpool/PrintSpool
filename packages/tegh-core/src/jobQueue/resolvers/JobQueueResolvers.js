const JobQueueResolvers = {
  id: source => source.config.host.id,
  name: source => source.config.host.name,
  jobs: (source, { id }) => {
    const { jobQueue } = source
    if (id != null) {
      const job = jobQueue.jobs.get(id)
      return [job]
    }
    const jobs = jobQueue.jobs.toList().sortBy(job => job.createdAt)
    return jobs
  },
}

export default JobQueueResolvers
