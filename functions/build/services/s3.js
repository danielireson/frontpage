"use strict";

const fs = require("./fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const client = new S3Client();

module.exports.syncDistFiles = async (bucketName) => {
  // env variable is only set for prod
  // do not sync in other environments
  if (process.env.DOMAIN_NAME) {
    const fileNames = fs.readDistDirectory();

    for (const fileName of fileNames) {
      const command = new PutObjectCommand({
        Bucket: process.env.DOMAIN_NAME,
        Key: fileName,
        Body: fs.readDistFile(fileName),
      });

      await client.send(command);
    }
  }
};
