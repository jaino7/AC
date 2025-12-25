import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// R2クライアントの初期化
const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export interface PresignedUrlRequest {
    filename: string;
    contentType: string;
}

export interface PresignedUrlResponse {
    uploadUrl: string;
    fileUrl: string;
    key: string;
}

/**
 * Presigned URLを生成する
 * @param request ファイル名とコンテンツタイプ
 * @returns アップロード用URL、公開URL、キー
 */
export async function generatePresignedUrl(
    request: PresignedUrlRequest
): Promise<PresignedUrlResponse> {
    // ユニークなファイル名を生成
    const fileExtension = request.filename.split(".").pop();
    const key = `uploads/${uuidv4()}.${fileExtension}`;

    // Put Object用のコマンドを作成
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        ContentType: request.contentType,
    });

    // 署名付きURLを生成（5分間有効）
    const uploadUrl = await getSignedUrl(r2Client, command, {
        expiresIn: 300, // 5分
    });

    // 公開URL
    const fileUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return {
        uploadUrl,
        fileUrl,
        key,
    };
}

export { r2Client };
