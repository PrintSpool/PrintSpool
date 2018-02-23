## Folder Structure

The top level directories in `core` are organized by domain
(see https://redux.js.org/faq/code-structure#structure-file-structure and https://marmelab.com/blog/2015/12/17/react-directory-structure.html).

Within each top level directory there can be:
* an `actions` directory containing:
  * actions and their GraphQL mutations
* a `reducers` directory containing:
  * reducers and their selectors
* a `types` directory containing:
  * ImmutableJS records and their GraphQL types
* a `subscriptions` directory containing:
  * GraphQL subscriptions

A `util` directory contains code that does not fit neatly into any of those directories.
