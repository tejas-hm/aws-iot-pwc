import { v4 as uuidv4 } from "uuid";
const { sendResponse } = require("../utils");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });

const handler = async (event) => {
  try {
    const params = {
      TableName: "deviceData"
    };

    const response = await documentClient.scan(params).promise();
    const deviceData = response.Items;

    const deviceTypes = { ac_type: "AC", tv_type: "TV", fridge_type: "FRIDGE" };
    const deviceBrands = ["Samsung", "LG", "IFB"];

    const devices = [];
    for (let i = 0; i < deviceData.length; i++) {
      devices.push({
        deviceId: deviceData[i].deviceId,
        deviceBrand: deviceBrands[Math.floor(Math.random() * 3)],
        deviceType: deviceTypes[deviceData[i].deviceType]
      });
    }

    return sendResponse(200, { message: "Success", data: devices });
  } catch (error) {
    const message = error.message ? error.message : "Internal server error";
    return sendResponse(500, { message });
  }
};

handler();

module.exports = { handler };
