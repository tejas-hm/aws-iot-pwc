const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const BUCKET_NAME = "iot-poc-device-data-archive";
module.exports.handler = async (event) => {
  const records = event.Records;
  const promises = records.map(async (record) => {
    const payload = Buffer.from(record.kinesis.data, "base64").toString("utf-8");
    const fileName = `kinesis-record-${Date.now()}.json`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: payload,
      ContentType: "application/json"
    };

    await S3.putObject(params).promise();
  });

  await Promise.all(promises);
  return `Successfully processed ${records.length} records.`;
};
