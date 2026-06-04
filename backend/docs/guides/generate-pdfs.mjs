import { readFileSync, writeFileSync } from "fs";
import { dirname, join, basename } from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";
import puppeteer from "puppeteer-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const chromePath =
  process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : process.env.CHROME_PATH || "google-chrome";

const css = readFileSync(join(__dirname, "pdf-styles.css"), "utf8");

const guides = [
  { md: "s3-bucket-setup-guide.md", pdf: "S3-Bucket-Setup-Guide.pdf" },
  { md: "vercel-backend-deployment-guide.md", pdf: "Vercel-Backend-Deployment-Guide.pdf" }
];

function wrapHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>${css}</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});

for (const { md, pdf } of guides) {
  const mdPath = join(__dirname, md);
  const source = readFileSync(mdPath, "utf8");
  const title = basename(md, ".md").replace(/-/g, " ");
  const bodyHtml = marked.parse(source);
  const html = wrapHtml(title, bodyHtml);
  const htmlPath = join(__dirname, `${basename(md, ".md")}.html`);
  writeFileSync(htmlPath, html);

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: join(__dirname, pdf),
    format: "A4",
    margin: { top: "20mm", right: "18mm", bottom: "20mm", left: "18mm" },
    printBackground: true
  });
  await page.close();
  console.log(`Created ${pdf}`);
}

await browser.close();
