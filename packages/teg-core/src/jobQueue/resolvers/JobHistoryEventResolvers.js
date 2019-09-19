const JobHistoryEventResolvers = {
  JobHistoryEvent: {
    type: source => source.type.replace('/jobQueue/JobHistory/', ''),
  },
}

export default JobHistoryEventResolvers
