import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function () {
  const dir = path.join(__dirname, "instagramData");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      return JSON.parse(content);
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
