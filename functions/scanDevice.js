import { v4 as uuidv4 } from "uuid";
const { sendResponse } = require("../utils");

const handler = async (event) => {
  try {
    const params = {
      TableName: "plansData"
    };

    const lim = Math.floor(Math.random() * (3 - 1 + 1) + 1);

    const i = Math.floor(Math.random() * 3);

    const deviceTypes = ["AC", "TV", "FRIDGE"];
    const deviceBrands = ["Samsung", "LG", "IFB"];

    const devices = [];
    for (let i = 0; i < lim; i++) {
      devices.push({
        deviceId: uuidv4(),
        deviceBrand: deviceBrands[Math.floor(Math.random() * 3)],
        deviceType: deviceTypes[Math.floor(Math.random() * 3)]
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
