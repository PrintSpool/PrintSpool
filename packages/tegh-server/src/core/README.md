## Folder Structure

The top level directories in `core` are organized by domain
(see https://redux.js.org/faq/code-structure#structure-file-structure and https://marmelab.com/blog/2015/12/17/react-directory-structure.html).

Within each top level directory there MAY be:
* an `actions` directory containing:
  * actions
* a `mutations` directory containing:
  * GraphQL mutations - each mutation SHOULD map directly to an action
* a `reducers` directory containing:
  * reducers
* a `selectors` directory containing:
  * selectors
* a `types` directory containing:
  * ImmutableJS records and their GraphQL types
* a `subscriptions` directory containing:
  * GraphQL subscriptions

A `util` directory contains code that does not fit neatly into any of those directories.
