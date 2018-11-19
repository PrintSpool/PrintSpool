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

* Current Configuration UI puts Plugin-specific settings into a JSON text field under 'Advanced'. Bad UX. Plugin settings should not be second class citizens.
* Tegh is being designed with intent to support combinators in a future version. Any current configuration architecture decision that does not take combinators into account today may cause breaking changes and cause unneccessary rewrites when combinators are introduced in the future.

## Considered Options

* Add Plugin-specific settings to the configuration query types.
  * Incompatible types could be defined in 2 plugins such that they are unable to be merged into a combinator schema.

## Decision Outcome

Chosen option: "[option 1]", because [justification. e.g., only option, which meets k.o. criterion decision driver | which resolves force force | … | comes out best (see below)].

Positive Consequences: <!-- optional -->
* [e.g., improvement of quality attribute satisfaction, follow-up decisions required, …]
* …

Negative consequences: <!-- optional -->
* [e.g., compromising quality attribute, follow-up decisions required, …]
* …

## Pros and Cons of the Options <!-- optional -->

### [option 1]

[example | description | pointer to more information | …] <!-- optional -->

* Good, because [argument a]
* Good, because [argument b]
* Bad, because [argument c]
* … <!-- numbers of pros and cons can vary -->

### [option 2]

[example | description | pointer to more information | …] <!-- optional -->

* Good, because [argument a]
* Good, because [argument b]
* Bad, because [argument c]
* … <!-- numbers of pros and cons can vary -->

### [option 3]

[example | description | pointer to more information | …] <!-- optional -->

* Good, because [argument a]
* Good, because [argument b]
* Bad, because [argument c]
* … <!-- numbers of pros and cons can vary -->

## Links <!-- optional -->

* [Link type] [Link to ADR] <!-- example: Refined by [ADR-0005](0005-example.md) -->
* … <!-- numbers of links can vary -->
