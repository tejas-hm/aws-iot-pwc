const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });

const { sendResponse } = require("../utils");

const handler = async (event) => {
  const { email } = event.requestContext.authorizer.claims;

  let params = {
    TableName: "usersData",
    Key: { email }
  };

  console.log("Params", params);

  const response = await documentClient.get(params).promise();
  const userData = response.Item;
  const userDevices = userData.devices;

  console.log("User Devices", userDevices);

  const Keys = Object.keys(userDevices).map((deviceIdItem) => {
    return { deviceId: deviceIdItem };
  });

  params = { RequestItems: { deviceData: { Keys: Keys } } };

  const dataObj = await documentClient.batchGet(params).promise();

  const devices = dataObj.Responses.deviceData;

  for (let device of devices) {
    device.name = userDevices[device.deviceId].name;
    device.permissions = userDevices[device.deviceId].permissions;
  }

  console.log("Devices", devices);

  return sendResponse(200, {
    message: "Success",
    data: devices
  });
};

module.exports = { handler };
