import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const s3 = new S3Client();

const __dirname = import.meta.dirname;

const STORAGE_DIR =
  process.env.NODE_ENV === "production"
    ? "/tmp"
    : path.resolve(__dirname, "../dist");

export const writeDistFile = (fileName, data) => {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  fs.writeFileSync(path.resolve(STORAGE_DIR, `${fileName}.html`), data);
};

export const syncDistFiles = async (bucketName) => {
  if (process.env.NODE_ENV === "production") {
    const fileNames = fs
      .readdirSync(STORAGE_DIR)
      .filter((file) => file.endsWith(".html"));

    for (const fileName of fileNames) {
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
        Body: fs.readFileSync(path.resolve(STORAGE_DIR, fileName)),
        ContentType: "text/html",
      });

      await s3.send(command);
    }
  }
};

export default {
  writeDistFile,
  syncDistFiles,
};
