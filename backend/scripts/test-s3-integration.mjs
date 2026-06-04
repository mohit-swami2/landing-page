/**
 * S3 integration smoke test — bucket access, upload, presigned URL, optional API project.
 * Run: node scripts/test-s3-integration.mjs
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");

dotenv.config({ path: path.join(backendRoot, ".env") });

const TEST_IMAGE = path.join(
  backendRoot,
  "../frontend/public/uploads/Birlingo-home-screen.png"
);

const results = {
  passed: [],
  failed: [],
  details: {}
};

function pass(name, detail = {}) {
  results.passed.push(name);
  results.details[name] = { ok: true, ...detail };
  console.log(`✅ ${name}`);
  if (Object.keys(detail).length) console.log("   ", JSON.stringify(detail, null, 2).split("\n").join("\n    "));
}

function fail(name, error) {
  const message = error?.message || String(error);
  results.failed.push({ name, message });
  results.details[name] = { ok: false, error: message };
  console.error(`❌ ${name}: ${message}`);
}

async function testEnvVars() {
  const required = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "AWS_BUCKET_NAME"
  ];
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    fail("Environment variables", new Error(`Missing: ${missing.join(", ")}`));
    return false;
  }
  pass("Environment variables", {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET_NAME,
    accessKeyPrefix: `${process.env.AWS_ACCESS_KEY_ID.slice(0, 4)}...`
  });
  return true;
}

async function testS3Service() {
  const { assertS3Access, uploadFile, generatePresignedDownloadUrl, deleteFile } =
    await import("../src/services/s3Service.js");

  if (!fs.existsSync(TEST_IMAGE)) {
    fail("Test image file", new Error(`Not found: ${TEST_IMAGE}`));
    return;
  }

  const buffer = fs.readFileSync(TEST_IMAGE);
  const fakeFile = {
    buffer,
    mimetype: "image/png",
    originalname: "s3-test-birlingo-home.png",
    size: buffer.length
  };

  try {
    await assertS3Access();
    pass("S3 bucket access (HeadBucket)");
  } catch (e) {
    fail("S3 bucket access (HeadBucket)", e);
    return;
  }

  let uploadedKey;
  try {
    const upload = await uploadFile(fakeFile);
    uploadedKey = upload.key;
    pass("S3 uploadFile", { key: uploadedKey, status: upload.status });
  } catch (e) {
    fail("S3 uploadFile", e);
    return;
  }

  try {
    const signed = await generatePresignedDownloadUrl({ key: uploadedKey, expiresIn: 300 });
    const res = await fetch(signed.downloadUrl, { method: "GET", headers: { Range: "bytes=0-99" } });
    if (res.ok || res.status === 206) {
      pass("Presigned download URL", {
        key: uploadedKey,
        httpStatus: res.status,
        urlPreview: `${signed.downloadUrl.slice(0, 80)}...`
      });
      results.details["Presigned download URL"].fullUrl = signed.downloadUrl;
    } else {
      fail("Presigned download URL", new Error(`GET returned ${res.status}`));
    }
  } catch (e) {
    fail("Presigned download URL", e);
  }

  try {
    await deleteFile(uploadedKey);
    pass("S3 deleteFile (cleanup test object)", { key: uploadedKey });
  } catch (e) {
    fail("S3 deleteFile", e);
  }
}

async function testApiProjectWithImage() {
  const port = process.env.PORT || 5000;
  const base = `http://127.0.0.1:${port}`;
  const email = "mohit@mailinator.com";
  const password = "123123123";

  let token;
  try {
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!loginRes.ok) {
      const body = await loginRes.text();
      fail("API login", new Error(`${loginRes.status} ${body}`));
      return;
    }
    const loginData = await loginRes.json();
    token = loginData.token;
    pass("API login");
  } catch (e) {
    fail("API login", new Error(`${e.message} — is backend running on port ${port}?`));
    return;
  }

  const slug = `s3-test-${Date.now()}`;
  const form = new FormData();
  form.append("name", "S3 Integration Test Project");
  form.append("slug", slug);
  form.append("shortDescription", "Automated S3 upload verification");
  form.append("detailedDescription", "Created by test-s3-integration.mjs");
  form.append("liveLink", "");
  form.append("techStack", "Node.js");
  form.append("techStack", "AWS S3");
  form.append("visible", "true");

  const blob = new Blob([fs.readFileSync(TEST_IMAGE)], { type: "image/png" });
  form.append("images", blob, "s3-test-project.png");

  try {
    const createRes = await fetch(`${base}/api/projects`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    const createData = await createRes.json().catch(() => ({}));
    if (!createRes.ok) {
      fail("Create project with image", new Error(`${createRes.status} ${JSON.stringify(createData)}`));
      return;
    }

    const imageKeys = createData.imageKeys || [];
    const images = createData.images || [];
    const hasKey = imageKeys.some((k) => k.startsWith("uploads/"));
    const hasSignedUrl = images.some((u) => typeof u === "string" && u.includes("amazonaws.com"));

    if (hasKey && hasSignedUrl) {
      pass("Create project with image", {
        projectId: createData._id,
        slug,
        imageKeys,
        imageUrlPreview: `${images[0]?.slice(0, 90)}...`
      });
      results.details["Create project with image"].fullImageUrl = images[0];

      const imgRes = await fetch(images[0], { method: "GET", headers: { Range: "bytes=0-99" } });
      if (imgRes.ok || imgRes.status === 206) {
        pass("Project image URL loads in browser", { httpStatus: imgRes.status });
      } else {
        fail("Project image URL loads in browser", new Error(`GET ${imgRes.status}`));
      }
    } else {
      fail("Create project with image", new Error(`Missing keys or signed URLs: ${JSON.stringify(createData)}`));
    }
  } catch (e) {
    fail("Create project with image", e);
  }
}

console.log("\n=== S3 Integration Test ===\n");

const envOk = await testEnvVars();
if (envOk) {
  console.log("");
  await testS3Service();
}

console.log("\n--- API test (requires running backend) ---\n");
await testApiProjectWithImage();

console.log("\n=== Summary ===");
console.log(`Passed: ${results.passed.length}`);
console.log(`Failed: ${results.failed.length}`);
if (results.failed.length) {
  results.failed.forEach((f) => console.log(`  - ${f.name}: ${f.message}`));
  process.exit(1);
}
console.log("\nAll tests passed. S3 is working with this codebase.\n");
process.exit(0);
