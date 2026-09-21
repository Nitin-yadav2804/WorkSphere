import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.join(__dirname, "../../uploads");

const r2 =
    process.env.STORAGE_PROVIDER === "r2"
        ? new S3Client({
              region: "auto",
              endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
              credentials: {
                  accessKeyId: process.env.R2_ACCESS_KEY_ID,
                  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
              },
          })
        : null;

export const uploadToStorage = async ({
    key,
    body,
    contentType,
}) => {
    if (process.env.STORAGE_PROVIDER === "r2") {
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: contentType,
        });

        await r2.send(command);

        return key;
    }

    const filePath = path.join(uploadDirectory, key);

    await fs.mkdir(path.dirname(filePath), {
        recursive: true,
    });

    await fs.writeFile(filePath, body);

    return key;
};

export const deleteFromStorage = async (key) => {
    if (process.env.STORAGE_PROVIDER === "r2") {
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        await r2.send(command);

        return;
    }

    const filePath = path.join(uploadDirectory, key);

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
};

export const getStorageUrl = async (key) => {
    if (process.env.STORAGE_PROVIDER === "r2") {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        return getSignedUrl(r2, command, {
            expiresIn: 300,
        });
    }

    return `/api/files/download/${encodeURIComponent(key)}`;
};

export const getLocalFilePath = (key) => {
    const filePath = path.resolve(
        uploadDirectory,
        key
    );

    const resolvedUploadDirectory = path.resolve(
        uploadDirectory
    );

    if (
        !filePath.startsWith(
            `${resolvedUploadDirectory}${path.sep}`
        )
    ) {
        throw new Error("Invalid storage key");
    }

    return filePath;
};
