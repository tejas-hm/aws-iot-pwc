const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });

const { sendResponse } = require("../utils");

const handler = async (event) => {
  const { email } = event.requestContext.authorizer.claims;

  const date = new Date();

  const currentDate = date.getTime();

  let params = {
    TableName: "subscriptions",
    Key: { email }
  };

  const subscriptionsObject = await documentClient.get(params).promise();

  if (subscriptionsObject.Item) {
    const subscriptionItem = subscriptionsObject.Item;
    const start = subscriptionItem.startDate;
    const end = subscriptionItem.endDate;
    const planName = subscriptionItem.planName;

    if (start < currentDate && currentDate < end) {
      return sendResponse(200, {
        message: "Success",
        data: {
          status: "active",
          startDate: start,
          endDate: end,
          planName
        }
      });
    }
  }
};

module.exports = { handler };
