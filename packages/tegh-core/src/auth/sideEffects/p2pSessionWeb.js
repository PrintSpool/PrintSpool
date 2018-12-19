
// window.crypto.subtle
// const
// let createSessionKey

// const createECDHKey = subtleCrypto => (
//   subtleCrypto.generateKey(
//     {
//       name: 'ECDH',
//       namedCurve: 'P-256', // can be 'P-256', 'P-384', or 'P-521'
//     },
//     true, // whether the key is extractable (i.e. can be used in exportKey)
//     ['deriveKey', 'deriveBits'] // can be any combination of 'deriveKey' and 'deriveBits'
//   )
// )

// const importPublicKey = raw => subtleCrypto.importKey(
//   'raw',
//   raw,
//   {
//     // these are the algorithm options
//     name: 'ECDH',
//     namedCurve: 'P-256', // can be 'P-256', 'P-384', or 'P-521'
//   },
//   false,
//   ['deriveKey', 'deriveBits'],
// )

//   window.crypto.subtle.importKey(
//       "raw", //only "raw" is allowed
//       concatenatedDHs, //your raw key data as an ArrayBuffer
//       {
//           name: "HKDF",
//       },
//       false, //whether the key is extractable (i.e. can be used in exportKey)
//       ["deriveKey", "deriveBits"] //can be any combination of "deriveKey" and "deriveBits"
//   )
//   // derive the session key
//   const sharedSessionsKey = await subtleCrypto.deriveKey(
//     {
//       name: 'HKDF',
//       // one time use salt
//       salt: ArrayBuffer,
//       // extra authenticated data
//       info: ArrayBuffer,
//       // can be 'SHA-1', 'SHA-256', 'SHA-384', or 'SHA-512'
//       hash: { name: 'SHA-512' },
//     },
//     // your key from importKey
//     concatenatedKeys,
//     {
//       // the key type you want to create based on the derived bits
//       // can be any AES algorithm ('AES-CTR', 'AES-CBC', 'AES-CMAC', 'AES-GCM',
//       // 'AES-CFB', 'AES-KW', 'ECDH', 'DH', or 'HMAC')
//       name: 'AES-GCM',
//       // the generateKey parameters for that type of algorithm
//       // can be  128, 192, or 256
//       length: 256,
//     },
//     // whether the derived key is extractable (i.e. can be used in exportKey)
//     false,
//     // limited to the options in that algorithm's importKey
//     ['encrypt', 'decrypt'],
//   )
//
//   return sharedSessionsKey
// }
