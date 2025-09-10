const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// ✅ Initialize S3 client with environment configuration
const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.BUCKET_NAME;

/**
 * Lambda handler for file management API.
 * Supports CRUD operations for S3 objects with user isolation (Cognito identity).
 *
 * Routes by HTTP method:
 * - OPTIONS → CORS preflight
 * - GET     → List user files
 * - POST    → Multiple actions (upload, download, presigned URLs, create folder, delete folder)
 * - DELETE  → Delete single file
 */
exports.handler = async (event) => {
  console.log("Full Event:", JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;

    // ==============================
    // OPTIONS → Preflight response
    // ==============================
    if (method === "OPTIONS") {
      return response(200, { message: "CORS preflight OK" });
    }

    // ==============================
    // Authentication: Extract Cognito user ID (sub claim)
    // ==============================
    const userId = event.requestContext?.authorizer?.claims?.sub;
    console.log("👉 UserID from token:", userId);
    if (!userId) {
      return response(401, { error: "Unauthorized: missing Cognito identity" });
    }

    // Restrict each user to their own folder prefix
    const userPrefix = `users/${userId}/`;

    // ==============================
    // GET → List files under user prefix
    // ==============================
    if (method === "GET") {
      const prefix = event.queryStringParameters?.prefix
        ? `${userPrefix}${event.queryStringParameters.prefix}`
        : userPrefix;

      const data = await s3.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix,
        })
      );

      return response(
        200,
        (data.Contents || []).map((obj) => ({
          Key: obj.Key.replace(userPrefix, ""), // Strip user prefix → only filename
          Size: obj.Size,
          LastModified: obj.LastModified,
        }))
      );
    }

    // ==============================
    // POST → Handle multiple actions
    // ==============================
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { action } = body;

      switch (action) {
        // ------------------------------
        // Generate presigned download URL
        // ------------------------------
        case "download": {
          const key = `${userPrefix}${body.key}`;
          const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ResponseContentDisposition: "attachment",
          });
          const url = await getSignedUrl(s3, command, { expiresIn: 60 });
          return response(200, { url });
        }

        // ------------------------------
        // Generate presigned upload URL
        // ------------------------------
        case "getUploadUrl": {
          const key = `${userPrefix}${body.key}`;
          const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: body.contentType || "application/octet-stream",
          });
          const url = await getSignedUrl(s3, command, { expiresIn: 300 });
          return response(200, { url });
        }

        // ------------------------------
        // Create folder (zero-byte object ending with /)
        // ------------------------------
        case "createFolder": {
          const { basePrefix = "", folderName } = body;
          const folderKey = `${userPrefix}${basePrefix}${folderName}/`;

          await s3.send(
            new PutObjectCommand({
              Bucket: BUCKET,
              Key: folderKey,
              Body: "",
            })
          );

          return response(200, { message: "Folder created!", Key: folderKey });
        }

        // ------------------------------
        // Delete folder and its contents
        // ------------------------------
        case "deleteFolder": {
          const prefix = `${userPrefix}${body.prefix}`;
          const listed = await s3.send(
            new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix })
          );

          if (listed.Contents && listed.Contents.length > 0) {
            const objects = listed.Contents.map((obj) => ({ Key: obj.Key }));
            await s3.send(
              new DeleteObjectsCommand({
                Bucket: BUCKET,
                Delete: { Objects: objects },
              })
            );
            return response(200, { message: "Folder and all contents deleted!" });
          }

          await s3.send(
            new DeleteObjectCommand({ Bucket: BUCKET, Key: prefix })
          );
          return response(200, { message: "Empty folder deleted!" });
        }

        default:
          // ------------------------------
          // Direct upload with base64 body
          // ------------------------------
          if (body.key && body.content) {
            const key = `${userPrefix}${body.key}`;
            await s3.send(
              new PutObjectCommand({
                Bucket: BUCKET,
                Key: key,
                Body: Buffer.from(body.content, "base64"),
              })
            );
            return response(200, { message: "Uploaded!", Key: key });
          }
          break;
      }
    }

    // ==============================
    // DELETE → Delete single file
    // ==============================
    if (method === "DELETE") {
      const body = JSON.parse(event.body || "{}");
      const key = `${userPrefix}${body.key}`;
      await s3.send(
        new DeleteObjectCommand({
          Bucket: BUCKET,
          Key: key,
        })
      );
      return response(200, { message: "Deleted!" });
    }

    // Unsupported method
    return response(405, { error: "Unsupported method" });
  } catch (err) {
    console.error("Lambda error:", err);
    return response(500, { error: err.message });
  }
};

/**
 * Helper: Standardized API Gateway response
 * - Includes CORS headers.
 * - Ensures consistent structure for all responses.
 */
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
      "Access-Control-Allow-Headers":
        "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
    },
    body: JSON.stringify(body),
  };
}
