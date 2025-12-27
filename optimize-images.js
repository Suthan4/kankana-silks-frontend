import sharp from "sharp";
import fs from "fs";

const inputDir = "public/kankana-silks";
const outputDir = "public/kankana-silks-webp";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdirSync(inputDir)
  .filter((f) => /\.(jpe?g)$/i.test(f))
  .forEach((file) => {
    sharp(`${inputDir}/${file}`)
      .resize({ width: 1600 })
      .webp({ quality: 80 })
      .toFile(`${outputDir}/${file.replace(/\.(jpe?g)$/i, ".webp")}`)
      .then(() => console.log(`✔ Optimized: ${file}`))
      .catch((err) => console.error(`❌ Error: ${file}`, err));
  });
