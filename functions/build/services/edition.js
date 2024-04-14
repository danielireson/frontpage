import path from "path";
import fs from "fs";

const __dirname = import.meta.dirname;

const EDITIONS_DIR = "../editions";

export const loadDefinitions = () => {
  const rootPath = path.resolve(__dirname, EDITIONS_DIR);

  return fs
    .readdirSync(rootPath)
    .filter((file) => file.endsWith(".json"))
    .map((file) => fs.readFileSync(path.resolve(rootPath, file), "utf8"))
    .map((file) => JSON.parse(file));
};

export default {
  loadDefinitions,
};
