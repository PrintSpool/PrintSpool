import { Jose } from 'jose-jwe-jws'

// See https://github.com/square/js-jose/issues/69
(function patchJose() {
  const old = Jose.WebCryptographer.keyId
  Jose.WebCryptographer.keyId = function (key) { return old({ n: key.n, d: key.e }) }
}())
