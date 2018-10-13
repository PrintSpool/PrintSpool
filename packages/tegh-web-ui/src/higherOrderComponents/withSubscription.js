
const withSubscription = (subscription, {
  name,
  options = {},
  props = props => props,
  variables = props => ({}),
  updateQuery,
}) => Component => (
  graphql(subscription, {
    name,
    options,
    props,
  })(
    class ComponentWithSubscription extends React.Component {
      componentWillMount() {
        return props[name].subscribeToMore({
          document: subscription,
          variables: variables(props),
          updateQuery,
        })
      }

      render() {
        return <Component {...props} />
      }
    },
  )
)

export default withSubscription
