# Configuration API for Heterogeneous CNC Networks
<!--
  template: https://raw.githubusercontent.com/joelparkerhenderson/architecture_decision_record/master/adr_template_madr.md
-->

* Status: draft
* Deciders: d1plo1d
* Date: 2018-11-18

## Context and Problem Statement

A hypothetical future maker space has many networked CNC devices; Mills, Lathes, 3D Printers, Laser Cutters, and so on. The hypothetical maker space uses various future versions of Tegh with different plugins to control each of these machines. The maker space has an additional combinator Tegh host that combines the other Tegh instances and allows makers to securely control and configure all of the machines through a single WebRTC connection to a single GraphQL schema.


What would the configuration API of Tegh look like to accomidate all the different machines/tegh version/tegh plugin variations in that hypothetical future makerspace with one GraphQL Schema accessed by users from a statically hosted tegh.io GUI?

## Decision Drivers

* Current `extendedConfig` GUI puts Plugin-specific settings into a JSON text field under 'Advanced'. The UX of which is that Plugin settings do not feel as tightly integrated as other settings. It is felt that plugin-specific settings should not feel like second class citizens and that having them feel that way limits their usefulness.
* Tegh is being designed with intent to support combinators in a future version. Any current configuration architecture decision that does not take combinators into account today may cause breaking changes and cause unneccessary rewrites when combinators are introduced in the future.

## Considered Options

This ADR covers three related areas: the Queries, Mutations and the GUI for configuring 3D printers and their plugins. The considered options for each of these is broken out below:

### Queries
* extendedConfig JSON field
* Dynamic Query Schema
* JSON Flat Objects

### Mutations
* Patch
* JSON Flat Objects
* Dynamic Mutation Schema

### GUI

## Decision Outcome

Chosen query option: [Queries: JSON Flat Objects] because it is the only option that meets the criteria of maintaining type safety, preventing plugin/host-specific setting schema collisions and presents both plugin-specific and core settings as first class citizens.

Chosen mutation option: [Mutations: JSON Flat Objects] because it is the only option that meets the criteria of maintaining type safety, preventing plugin/host-specific setting schema collisions and presents both plugin-specific and core settings as first class citizens.

Chosen GUI option: TODO...

Positive Consequences: <!-- optional -->
* [e.g., improvement of quality attribute satisfaction, follow-up decisions required, …]
* …

Negative consequences: <!-- optional -->
* [e.g., compromising quality attribute, follow-up decisions required, …]
* …

## Pros and Cons of the Options <!-- optional -->

## Queries: extendedConfig JSON field

TODO:

### Queries: Dynamic Query Schema

Add Plugin-specific settings by dynamically adding extensions to the configuration query types in the GraphQL Schema as plugins or hosts connected to the combinator are added/removed.

* Good, because all types would be self documented by GraphQL
* Bad, because it would require the GraphQL schema to dynamically change based on which plugins are loaded which complicates the host and is not common practice in GraphQL.
* Bad, because a dynamic schema could have conflicting types defined in incompatible plugins or hosts that would be unresolvable by a Tegh Combinator.

## Queries: JSON Flat Objects

TODO:

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

A mutation would be created, `updateConfigObjects(printerID: ID!, input: [{action: CreateOrUpdateEnum!, type: ComponentOrPackageEnum!, id: ID, data: JSON!}!]!)`, such that an array of configuration objects - meaning Components or Plugins (General Conifgs such as printer name being wrapped in a `tegh-core` plugin) could be created and modified transactionally.

Each updated configuration object would be looked up by it's id on the host and have updates merged into it overwriting any previous values. To keep host update logic simple each configuration object would be required to be flat objects with either a scalar value or a list of scalar values at each key. Finally for type safety procedurally named configuration object-specific GraphQL mutations (eg. `addSerialController`, `updateAxis`, `updateTeghCorePlugin`) could be created for each type and mutated internally by the Host as part of an action creator or reducer to make sure that the data conforms to the expected Input Types and Output Types.

* Good, because the internal GraphQL mutations would allow type safety to be achieved using GraphQL itself as opposed to a more custom solution.
* Good, because read-only fields can be implemented via the internal GraphQL mutations
* Good, because plugin-specific settings can be set as first class properties of the Configuration Objects.
* Bad, because the JSON! data field does not self-document what can be input into it.

### Mutations: Dynamic Mutation Schema

A modification on the Flat Objects proposal in which an Input Union would be substituted for the data JSON! scalar.

* Good, because the `updateConfigObjects` inputs would be fully self-documented by GraphQL
* Bad because it would require the GraphQL schema to dynamically change based on which plugins are loaded which complicates the host and is not common practice in GraphQL.
* A dynamic schema could have conflicting input types defined in incompatible plugins or hosts that would be unresolvable by a Tegh Combinator.
* Bad, because GraphQL does not yet support input unions so our static typing options are limited for now. See: https://github.com/facebook/graphql/issues/488

## Links <!-- optional -->

* [Link type] [Link to ADR] <!-- example: Refined by [ADR-0005](0005-example.md) -->
* … <!-- numbers of links can vary -->
