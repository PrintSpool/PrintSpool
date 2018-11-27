const JobHistoryEventResolvers = {
  type: source => source.type.replace('/jobQueue/JobHistory/', ''),
}

export default JobHistoryEventResolvers
