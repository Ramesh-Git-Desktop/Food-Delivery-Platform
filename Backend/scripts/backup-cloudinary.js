const fs = require("fs");
const path = require("path");
const https = require("https");
const { execFile } = require("child_process");
const cloudinary = require("cloudinary").v2;

const S3_BUCKET = process.env.S3_BUCKET || "your-bucket";
const BACKUP_ROOT =
  process.env.CLOUDINARY_BACKUP_DIR ||
  path.join(__dirname, "..", "backups", "cloudinary");

const dateStamp = new Date().toISOString().slice(0, 10);
const backupDir = path.join(BACKUP_ROOT, dateStamp);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ensureDir = (dirPath) => fs.mkdirSync(dirPath, { recursive: true });

const downloadFile = (url, targetPath) =>
  new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(targetPath);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Download failed: ${response.statusCode}`));
          return;
        }
        response.pipe(fileStream);
        fileStream.on("finish", () => fileStream.close(resolve));
      })
      .on("error", reject);
  });

const uploadToS3 = (filePath, key) =>
  new Promise((resolve, reject) => {
    execFile(
      "aws",
      ["s3", "cp", filePath, `s3://${S3_BUCKET}/${key}`],
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });

const buildFilename = (resource) => {
  const safeId = resource.public_id.replace(/[\\/]/g, "_");
  const extension = resource.format ? `.${resource.format}` : "";
  return `${safeId}${extension}`;
};

const backupResources = async () => {
  ensureDir(backupDir);

  let nextCursor;
  let total = 0;

  do {
    const result = await cloudinary.api.resources({
      max_results: 500,
      next_cursor: nextCursor,
    });

    for (const resource of result.resources || []) {
      const filename = buildFilename(resource);
      const localPath = path.join(backupDir, filename);
      const s3Key = `backups/cloudinary/${dateStamp}/${filename}`;

      await downloadFile(resource.secure_url, localPath);
      await uploadToS3(localPath, s3Key);
      fs.unlinkSync(localPath);

      total += 1;
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log(`Backed up ${total} Cloudinary assets`);
};

backupResources().catch((error) => {
  console.error("Cloudinary backup failed:", error.message);
  process.exit(1);
});
