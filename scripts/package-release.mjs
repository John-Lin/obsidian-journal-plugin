import { cp, mkdir, rm } from "fs/promises";
import path from "path";

const projectRoot = process.cwd();
const releaseDir = path.join(projectRoot, "release");

async function main() {
  await rm(releaseDir, { recursive: true, force: true });
  await mkdir(releaseDir, { recursive: true });

  await cp(path.join(projectRoot, "dist", "main.js"), path.join(releaseDir, "main.js"));
  await cp(path.join(projectRoot, "manifest.json"), path.join(releaseDir, "manifest.json"));

  console.log("Release package generated in ./release");
}

main().catch((error) => {
  console.error("Failed to generate release package", error);
  process.exit(1);
});
