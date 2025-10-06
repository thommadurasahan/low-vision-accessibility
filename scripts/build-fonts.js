/**
 * Build script for copying Atkinson Hyperlegible Mono fonts into the extension.
 * Copies TTF font files from the external repository to assets/fonts/.
 */

const fs = require("fs");
const path = require("path");

const fontSourcePath = path.join(__dirname, "../external/atkinson-hyperlegible-next-mono/fonts/ttf");
const fontDestPath = path.join(__dirname, "../assets/fonts");

function copyFonts(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Font source folder not found: ${srcDir}`);
  }
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith(".ttf"));
  for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`Copied: ${file}`);
  }
}

async function main() {
  console.log("📦 Copying Atkinson Hyperlegible Mono fonts...");
  
  copyFonts(fontSourcePath, fontDestPath);
  
  console.log("✅ Fonts copied successfully into ./assets/fonts/");
}

main().catch(err => {
  console.error("❌ Font copy failed:", err);
  process.exit(1);
});
