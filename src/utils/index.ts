import CryptoJs from 'crypto-js'


const AccessKey = 'iEN5xmL+P7yPo98GF2Xowg=='
const SecretKey = 'uau+kLZRpTi9GGysDUdTYmdVtvEsefi6gQFEMCjzSCQ='

export function generateAuthentication(url: string, method = 'GET', data = ''): string {
  // For GET request, the RequestData is an empty string.
  const dataHash = CryptoJs.MD5(data).toString().toLocaleLowerCase(),
    baseString = method.toLocaleUpperCase() + ' ' + url + ' ' + dataHash,
    signature = CryptoJs.HmacSHA1(SecretKey, baseString).toString(),
    authorizationHeader = `ZAuth ${AccessKey}:${signature}`
  return authorizationHeader
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const safeCall = function(fn: Function, ...args: unknown[]) {
  try {
    return fn(args)
  } catch (err) {
    console.log('function call error:', err)
    return false
  }
}

export const sleep = function(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 1000)
  })
}
