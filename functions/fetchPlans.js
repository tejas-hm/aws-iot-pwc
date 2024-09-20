const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });
const { sendResponse } = require("../utils");

const handler = async (event) => {
  try {
    const params = {
      TableName: "plansData"
    };

    const result = await documentClient.scan(params).promise();
    return sendResponse(200, { message: "Success", data: result.Items });
  } catch (error) {
    const message = error.message ? error.message : "Internal server error";
    return sendResponse(500, { message });
  }
};

handler();

module.exports = { handler };
