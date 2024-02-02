
/**
 * @param {import('net').AddressInfo|null|string} address
 */
export function getAddressUrl(address) {
  if (!address) throw new Error(`address must not be null`)
  if (typeof address === 'string') throw new Error(`address must not be string, but is "${address}"`)
  return new URL(`http://localhost:${address.port}`)
}
