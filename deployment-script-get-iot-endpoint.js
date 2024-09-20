const AWS = require("aws-sdk");
const fs = require("fs");

(async () => {
  const iot = new AWS.Iot({ region: "us-east-1" }); // Replace with your region
  try {
    const result = await iot.describeEndpoint({ endpointType: "iot:Data-ATS" }).promise();
    const endpoint = result.endpointAddress;

    // Write the endpoint directly as a string
    fs.writeFileSync("iot-endpoint.json", JSON.stringify({ endpoint }));
    console.log("IoT Endpoint retrieved and saved:", endpoint);
  } catch (err) {
    console.error("Failed to retrieve IoT endpoint:", err);
    process.exit(1);
  }
})();
