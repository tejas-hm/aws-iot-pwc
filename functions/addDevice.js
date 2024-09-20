const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });

const { sendResponse } = require("../utils");
const {
  AC_TYPE: { SWITCH_POWER, VIEW_INFO, TEMP_CONTROL }
} = require("../utils/permissions");

const handler = async (event) => {
  const body = JSON.parse(event.body);
  const { deviceId, deviceName } = body;
  const { email } = event.requestContext.authorizer.claims;

  const params = {
    TableName: "usersData",
    Key: {
      email: email
    },
    UpdateExpression: "SET devices.#deviceID = :deviceData",
    ExpressionAttributeNames: {
      "#deviceID": deviceId
    },
    ExpressionAttributeValues: {
      ":deviceData": {
        name: "Living Room AC",
        permissions: [SWITCH_POWER, VIEW_INFO, TEMP_CONTROL]
      }
    },
    ReturnValues: "UPDATED_NEW"
  };
  console.log(params);

  const a = await documentClient.update(params).promise();

  return sendResponse(200, {
    message: `Device id ${deviceId} has been added to user ${email}`
  });
};

module.exports = { handler };
