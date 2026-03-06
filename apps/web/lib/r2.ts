import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

/**
 * URLを正規化する（https:// が https:/ に壊れる問題への対策）
 */
function normalizeUrl(url: string): string {
    // プロトコル部分の // が / に潰されていたら修正
    return url.replace(/^(https?):\/([^\/])/, '$1://$2');
}

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
        Bucket: process.env.R2_CONTENT_BUCKET_NAME!,
        Key: key,
        ContentType: request.contentType,
    });

    // 署名付きURLを生成（5分間有効）
    const uploadUrl = await getSignedUrl(r2Client, command, {
        expiresIn: 300, // 5分
    });

    // 公開URL（環境変数のURL破損対策として正規化）
    const rawUrl = `${process.env.R2_CONTENT_PUBLIC_URL}/${key}`;
    const fileUrl = normalizeUrl(rawUrl);

    return {
        uploadUrl,
        fileUrl,
        key,
    };
}

/**
 * R2から画像を取得するためのpresigned URLを生成
 * @param key R2オブジェクトキー
 * @param expiresIn 有効期限（秒）デフォルト: 3600（1時間）
 * @returns presigned URL
 */
export async function generatePresignedViewUrl(
    key: string,
    expiresIn: number = 3600
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_CONTENT_BUCKET_NAME!,
        Key: key,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
        expiresIn,
    });

    return presignedUrl;
}

/**
 * プライベートバケットから画像を取得するためのpresigned URLを生成（本人確認用）
 * @param key R2オブジェクトキー
 * @param expiresIn 有効期限（秒）デフォルト: 3600（1時間）
 * @returns presigned URL
 */
export async function generatePresignedViewUrlPrivate(
    key: string,
    expiresIn: number = 3600
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_PRIVATE_BUCKET_NAME!,
        Key: key,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
        expiresIn,
    });

    return presignedUrl;
}

export { r2Client };

