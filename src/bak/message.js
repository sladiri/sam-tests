let busCounter = 0

export function msg (data) {
  const {payload} = data
  if (payload === undefined) {
    console.log('msg - no payload')
  }
  busCounter += 1
  return {
    busCounter,
    timeStamp: Date.now(),
    payload,
  }
}

export function unmsg (to, from, message) {
  const {busCounter, timeStamp, payload} = message
  console.log(
    `unmsg - '${to}' got message from '${from}`,
    busCounter,
    {payload},
    new Date(timeStamp).toISOString()
  )
  return {payload}
}
