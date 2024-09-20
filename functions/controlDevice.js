const DynamoDB = require("aws-sdk/clients/dynamodb");
const { IotData } = require("aws-sdk");
const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });

const { sendResponse } = require("../utils");
const { isAuthorised } = require("../utils/subscriptions");
const permissions = require("../utils/permissions");

const handler = async (event) => {
  const body = JSON.parse(event.body);
  const { deviceId, temperature, status, operation } = body;
  const { email } = event.requestContext.authorizer.claims;

  const iotData = new IotData({ endpoint: process.env.iot_endpoint });

  const topic = `devices/${deviceId}`;

  const isAuthorised = async (deviceId, userId, operation) => {
    let params = {
      TableName: "usersData",
      Key: { email: userId }
    };

    const response = await documentClient.get(params).promise();
    const device = response.Item.devices[deviceId];
    return device.permissions.includes(operation);
  };

  try {
    if (await isAuthorised(deviceId, email, operation)) {
    } else {
      return sendResponse(403, {
        message: `${email} is not authorised to perform this operation`
      });
    }

    const params = {
      topic: topic,
      qos: 1,
      payload: JSON.stringify({ temperature, status, userId: email })
    };

    await iotData.publish(params).promise();

    const UpdateExpression = `set ${
      operation == permissions.AC_TYPE.SWITCH_POWER ? "#currentStatus= :currentStatus" : ""
    }${operation == permissions.AC_TYPE.TEMP_CONTROL ? "#data.#temperature= :temp" : ""}`;

    const ExpressionAttributeValues = {};
    const ExpressionAttributeNames = {};

    if (operation == permissions.AC_TYPE.SWITCH_POWER) {
      ExpressionAttributeValues[":currentStatus"] = status;
      ExpressionAttributeNames["#currentStatus"] = "currentStatus";
    }

    if (operation == permissions.AC_TYPE.TEMP_CONTROL) {
      ExpressionAttributeValues[":temp"] = temperature;
      ExpressionAttributeNames["#data"] = "data";
      ExpressionAttributeNames["#temperature"] = "temperature";
    }

    const updateParams = {
      TableName: "deviceData",
      Key: {
        deviceId
      },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "UPDATED_NEW"
    };
    await documentClient.update(updateParams).promise();

    return sendResponse(200, {
      message: `Changes posted succesfully for deviceId ${deviceId}`
    });
  } catch (err) {
    console.error("Error publishing message:", err);
    return {
      statusCode: 500,
      body: JSON.stringify("Failed to send message to IoT topic")
    };
  }
};

module.exports = { handler };
