const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });

const { sendResponse } = require("../utils");

const handler = async (event) => {
  const body = JSON.parse(event.body);
  const { planId } = body;
  const { email } = event.requestContext.authorizer.claims;

  let params = {
    TableName: "plansData",
    Key: { planId }
  };

  const planObject = await documentClient.get(params).promise();
  const plan = planObject.Item;

  const duration = plan.planDuration;
  const planName = plan.planName;

  const date = new Date();

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const startDate = date.getTime();
  date.setMonth(date.getMonth() + duration);
  const endDate = date.getTime();

  params = {
    TableName: "subscriptions",
    Key: {
      email: email
    },
    UpdateExpression:
      "set planId = :planId, startDate = :startDate, endDate= :endDate, planName= :planName",
    ExpressionAttributeValues: {
      ":planId": planId,
      ":startDate": startDate,
      ":endDate": endDate,
      ":planName": planName
    },
    ReturnValues: "UPDATED_NEW"
  };

  await documentClient.update(params).promise();

  return sendResponse(200, {
    message: `Plan Id ${planId} has been added to user ${email}`
  });
};

module.exports = { handler };
