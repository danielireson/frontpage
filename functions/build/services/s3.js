"use strict";

const fs = require("./fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const client = new S3Client();

module.exports.syncDistFiles = async (bucketName) => {
  if (process.env.NODE_ENV === "production") {
    const fileNames = fs.readDistDirectory();

    for (const fileName of fileNames) {
      const command = new PutObjectCommand({
        Bucket: process.env.DOMAIN_NAME,
        Key: fileName,
        Body: fs.readDistFile(fileName),
        ContentType: "text/html",
      });

      await client.send(command);
    }
  }
};
