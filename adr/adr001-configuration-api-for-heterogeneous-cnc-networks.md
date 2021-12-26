# Configuration API for Heterogeneous CNC Networks
<!--
  template: https://raw.githubusercontent.com/joelparkerhenderson/architecture_decision_record/master/adr_template_madr.md
-->

* Status: draft
* Deciders: d1plo1d
* Date: 2018-11-24

## Context and Problem Statement

A hypothetical future maker space has many networked CNC devices; Mills, Lathes, 3D Printers, Laser Cutters, and so on. The hypothetical maker space uses various future versions of Teg with different plugins to control each of these machines. The maker space has an additional combinator Teg host that combines the other Teg instances and allows makers to securely control and configure all of the machines through a single WebRTC connection to a single GraphQL schema.

What would the configuration API of Teg look like to accomodate all the different machines/teg version/teg plugin variations in that hypothetical future makerspace with one GraphQL Schema accessed by users from a statically hosted printspool.io GUI?

## Decision Drivers

* Current `extendedConfig` GUI puts Plugin-specific settings into a JSON text field under 'Advanced'. The UX of which is that Plugin settings do not feel as tightly integrated as other settings. It is felt that plugin-specific settings should not feel like second class citizens and that having them feel that way limits their usefulness.
* Teg is being designed with intent to support combinators in a future version. Any current configuration architecture decision that does not take combinators into account today may cause breaking changes and cause unneccessary rewrites when combinators are introduced in the future.

## Considered Options

This ADR covers three related areas: the Queries, Mutations and the GUI for configuring 3D printers and their plugins. The considered options for each of these is broken out below:

* Queries
  * extendedConfig JSON field
  * Dynamic Query Schema
  * JSON Flat Objects
* Mutations
  * Patch
  * JSON Flat Objects
  * Dynamic Mutation Schema
* GUI
  * extendedConfig TextField (See [GUI/Queries: extendedConfig JSON field])
  * Dynamic Forms

## Decision Outcome

Chosen options: [Queries: JSON Flat Objects] and [Mutations: JSON Flat Objects] because they are the only Query and Mutation option that meets the criteria of maintaining security via internal type safety, preventing schema collisions in a combinator and presents both plugin-specific and core settings as first class citizens.

Chosen GUI option: [GUI: Dynamic Forms] because it is the only GUI option that allows plugin-specific settings to be placed in the ideal arbitrary position within the GUI for an optimal UX.

## Pros and Cons of the Options <!-- optional -->

### GUI/Queries: extendedConfig JSON field

A `extendedConfig: JSON!` field is added to each configuration object where plugin-specific settings are stored seperate from the core settings which have explicitly typed fields in GraphQL.

The GUI uses a text field to edit the extendedConfigs JSON under an Advanced Settings tab that is closed by default.

* Good, because it is simple
* Bad, because the plugin-specific types are not self-documented or typed
* Bad, because extendedConfigs are queried differently then core configs making them second class citizens of the configuration query.
* Bad, because users have to know how to edit JSON documents.
* Bad, because plugin settings are hidden in an advanced settings tab regardless of where in the GUI they should have been placed for the best UX.

### Queries: Dynamic Query Schema

Add Plugin-specific settings by dynamically adding extensions to the configuration query types in the GraphQL Schema as plugins or hosts connected to the combinator are added/removed.

* Good, because all types would be self documented by GraphQL
* Bad, because it would require the GraphQL schema to dynamically change based on which plugins are loaded which complicates the host and is not common practice in GraphQL.
* Bad, because a dynamic schema could have conflicting types defined in incompatible plugins or hosts that would be unresolvable by a Teg Combinator.

### Queries: JSON Flat Objects

The configuration query API is such that each configuration object allows queries to a `JSON!` field that returns all it's configuration data from both core configs and plugin-specific configs.

* Good, because it is even simpler then extendedConfig
* Good, because the configuration query API is consistent between core configs and plugin-specific configs
* Bad, because the entire configuration is not self-documented or typed by GraphQL

### Mutations: Patch

A mutation `patchConfig(printerID: ID!, patch: [JSONPatchInput!]!` would be created such that RFC6902 JSON patches could be applied to the config structure as a whole.

* Good, because the internal GraphQL queries would allow some type safety to be achieved using GraphQL itself as opposed to a more custom solution.
* Good, because it allows for an arbitrary level of nested settings within the configuration
* Good, because it makes use of an existing standard and does not reinvent the JSON patch format
* Good, because plugin-specific settings can be set as first class properties of the Configuration Objects.
* Bad, because type safety is only enforced after the data is updated (ie. not fail-fast).
* Bad, because a custom solution would be needed to identify and prevent attempts to modify read-only settings.
* Bad, because a custom solution would be needed to identify patch entries that create new objects and wrap them in the appropriate Immutable Record type.

### Mutations: JSON Flat Objects

A mutation would be created, `updateConfigObjects(printerID: ID!, input: [{action: CreateOrUpdateEnum!, type: ComponentOrPackageEnum!, id: ID, data: JSON!}!]!)`, such that an array of configuration objects - meaning Components or Plugins (General Conifgs such as printer name being wrapped in a `@tegapp/core` plugin) could be created and modified transactionally.

Each updated configuration object would be looked up by it's id on the host and have updates merged into it overwriting any previous values. To keep host update logic simple each configuration object would be required to be flat objects with either a scalar value or a list of scalar values at each key. Finally for type safety procedurally named configuration object-specific GraphQL mutations (eg. `addSerialController`, `updateAxis`, `updateTegCorePlugin`) could be created for each type and mutated internally by the Host as part of an action creator or reducer to make sure that the data conforms to the expected Input Types and Output Types.

* Good, because the internal GraphQL mutations would allow type safety to be achieved using GraphQL itself as opposed to a more custom solution.
* Good, because read-only fields can be implemented via the internal GraphQL mutations
* Good, because plugin-specific settings can be set as first class properties of the Configuration Objects.
* Good, because the internal GraphQL mutation schema on the printer host will catch incompatible plugin fields at the time it is loaded and fail-fast,
* Goood, because combinators which will defer the internal mutations to their delegate printer hosts will be able to mutate configurations across printers without conflict between incompatible plugins on different hosts.
* Bad, because the JSON! data field does not self-document what can be input into it.

### Mutations: Dynamic Mutation Schema

A modification on the Flat Objects proposal in which an Input Union would be substituted for the data JSON! scalar.

* Good, because the `updateConfigObjects` inputs would be fully self-documented by GraphQL
* Bad because it would require the GraphQL schema to dynamically change based on which plugins are loaded which complicates the host and is not common practice in GraphQL.
* A dynamic schema could have conflicting input types defined in incompatible plugins or hosts that would be unresolvable by a Teg Combinator.
* Bad, because GraphQL does not yet support input unions so our static typing options are limited for now. See: https://github.com/facebook/graphql/issues/488

### GUI: Dynamic Forms

A `schemaForm: JSONSchemaForm!` field would be added to each configuration object that would describe the layout of the configuration objects' form and it's client-side validations.

* Good, because it uses an existing standard with implementations for material UI
* Good, because it allows Plugin-specific settings to be intermixed with Core settings as appropriate for the best UX.
* Good, because it enforces config form consistency across platforms.
* Bad, because it is more complicated then a static form.

## Links

* [json-schema-form](https://github.com/json-schema-form/json-schema-form/wiki/Documentation)
