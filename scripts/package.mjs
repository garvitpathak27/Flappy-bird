import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");

async function build() {
  const zip = new AdmZip();
  zip.addLocalFolder(path.join(ROOT, "extension"));
  await mkdir(DIST_DIR, { recursive: true });
  const output = path.join(DIST_DIR, "flappy-logic-extension.zip");
  zip.writeZip(output);
  console.log(`Created ${output}`);
}

build().catch((error) => {
  console.error("Failed to package extension", error);
  process.exitCode = 1;
});
