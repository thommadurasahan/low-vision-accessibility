/**
 * Build script for bundling GitHub VS Code theme into low-vision-accessibility extension.
 * It clones, builds, and copies theme JSON files automatically.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoPath = path.join(__dirname, "../external/github-vscode-theme");
const outputPath = path.join(__dirname, "../themes");

function run(cmd, cwd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

function copyThemes(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Theme output folder not found: ${srcDir}`);
  }
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith(".json"));
  for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`Copied: ${file}`);
  }
}

async function main() {
  console.log("🧱 Building GitHub VS Code Theme...");

  // Step 1: Install dependencies if not already done
  if (!fs.existsSync(path.join(repoPath, "node_modules"))) {
    if (fs.existsSync(path.join(repoPath, "package-lock.json"))) {
        run("npm ci", repoPath);
    } else {
        run("npm install", repoPath);
    }
  }

  // Step 2: Run build (creates JSON theme files)
  run("npm run build", repoPath);

  // Step 3: Copy output JSONs into the extension themes folder
  const distPath = path.join(repoPath, "themes"); // output folder created by the build
  copyThemes(distPath, outputPath);

  console.log("✅ GitHub themes copied successfully into ./themes/");
}

main().catch(err => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});