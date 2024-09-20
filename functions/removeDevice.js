const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });

const { sendResponse } = require("../utils");

const handler = async (event) => {
  const body = JSON.parse(event.body);
  const { deviceId } = body;
  const { email } = event.requestContext.authorizer.claims;

  params = {
    TableName: "usersData",
    Key: {
      email: email
    },
    UpdateExpression: "Remove devices.#deviceID",
    ExpressionAttributeNames: {
      "#deviceID": deviceId
    },
    cv: "UPDATED_NEW"
  };

  const a = await documentClient.update(params).promise();
  console.log(a);

  return sendResponse(200, {
    message: `Device id ${deviceId} has been removed for user ${email}`
  });
};

module.exports = { handler };
