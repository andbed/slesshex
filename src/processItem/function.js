const log = require('serverless-logger')(__filename)

const handler = async (event) => {
  const item = parseEvent(event)
  log('item', JSON.stringify(item))

  // this log message is used for testing
  // don't remove it. See: functionIsTriggeredByDdbStream.e2e.js
  log(`Processing item ${item.dynamodb.Keys.PK.S}`)

  // here you can implement rest of your Lambda code

  return true
}

const parseEvent = (event) => event.Records[0]

module.exports.handler = handler
