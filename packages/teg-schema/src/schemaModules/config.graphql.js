export default `
// # Queries

// extend type Query {
//   # hosts(hostID: ID): [Host!]!

//   materials(materialID: ID): [Material!]!

//   schemaForm(input: SchemaFormQueryInput!): JSONSchemaForm!
// }

// input SchemaFormQueryInput {
//   collection: ConfigCollection!
//   """
//     machineID is required for MACHINE ConfigCollection config forms
//   """
//   machineID: ID
//   # TODO: host conig support
//   # """
//   #   hostID is required for HOST ConfigCollection config forms
//   # """
//   # hostID: ID

//   # TODO: plugin schema form support
//   # for plugins the schemaFormKey is the plugin's package
//   """
//     The schemaFormKey is dependent on the collection:
//     - For collection = **"COMPONENT"** schemaFormKey should be the **component type** (eg. \`"CONTROLLER"\`)
//     - For collection = **"MATERIAL"** schemaFormKey should be the **material type** (eg. \`"FDM_FILAMENT"\`)
//     - For collection = **"PLUGIN"** schemaFormKey should be the **plugin name** (eg. \`"@tegapp/core"\`)
//     - For collection = **"MACHINE"** schemaFormKey should be the **machine descriptor DAT URL** (eg. \`"dat://..."\`)
//   """

//   schemaFormKey: ID!
// }

// # type Host {
// #   id: ID!
// #   configForm: ConfigForm!
// # }

// type Material {
//   id: ID!
//   type: String!
//   name: String!
//   shortSummary: String!
//   configForm: ConfigForm!
// }

// type ConfigForm {
//   id: ID!
//   model: JSON!
//   modelVersion: Int!
//   schemaForm: JSONSchemaForm!
// }

// type JSONSchemaForm {
//   id: ID!,
//   schema: JSON!
//   form: JSON!
// }

// # Mutations

// extend type Mutation {
//   createConfig(input: CreateConfigInput!): SetConfigResponse!
//   updateConfig(input: UpdateConfigInput!): SetConfigResponse!
//   deleteConfig(input: DeleteConfigInput!): Boolean

//   createMachine(input: CreateMachineInput!): SetConfigResponse!
//   setMaterials(input: SetMaterialsInput!): Boolean
// }

// type SetConfigResponse {
//   errors: [JSONSchemaError!]
// }

// type JSONSchemaError {
//   """
//     validation keyword.
//   """
//   keyword: String!
//   """
//     the path to the part of the data that was validated using
//     the RFC6901 JSON pointer standard (e.g., "/prop/1/subProp").
//   """
//   dataPath: String!
//   """
//     the path (JSON-pointer as a URI fragment) to the schema of the keyword that
//     failed validation.
//   """
//   schemaPath: String!
//   """
//     the object with the additional information about error that can be used to
//     create custom error messages (e.g., using ajv-i18n package). See below for
//     parameters set by all keywords.
//   """
//   params: JSON!
//   """
//     the standard error message
//   """
//   message: String!
// }
