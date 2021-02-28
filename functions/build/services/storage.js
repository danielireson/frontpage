"use strict";

const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client();

const rootPath =
  process.env.NODE_ENV === "production"
    ? "/tmp"
    : path.resolve(__dirname, "../dist");

module.exports.writeDistFile = (fileName, data) => {
  fs.writeFileSync(path.resolve(rootPath, `${fileName}.html`), data);
};

module.exports.syncDistFiles = async (bucketName) => {
  if (process.env.NODE_ENV === "production") {
    const fileNames = fs
      .readdirSync(rootPath)
      .filter((file) => file.endsWith(".html"));

    for (const fileName of fileNames) {
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
        Body: fs.readFileSync(path.resolve(rootPath, `${fileName}`)),
        ContentType: "text/html",
      });

      await s3.send(command);
    }
  }
};
