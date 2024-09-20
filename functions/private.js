const { sendResponse } = require('../utils')

module.exports.handler = async (event) => {
    return sendResponse(200, { message: `Email ${event.requestContext.authorizer.claims.email} has been authorized` })
}