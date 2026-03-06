import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

/**
 * URLを正規化する
 * - Markdownリンク記法 [text](url) が混入している場合にURLだけ抽出
 * - https:// が https:/ に壊されていた場合に修正
 * - 末尾の余計なスラッシュを除去
 */
function normalizeUrl(url: string): string {
    let cleaned = url;

    // Markdownリンク記法 [text](url) からURLだけ抽出
    // 例: "[https://example.com](https://example.com/)" → "https://example.com/"
    const markdownMatch = cleaned.match(/\[([^\]]*)\]\(([^)]*)\)/);
    if (markdownMatch) {
        // 括弧内のURLを使う（通常こちらが実際のURL）
        cleaned = markdownMatch[2];
    }

    // プロトコル部分の // が / に潰されていたら修正
    cleaned = cleaned.replace(/^(https?):\/([^\/])/, '$1://$2');

    // 末尾のスラッシュを除去
    cleaned = cleaned.replace(/\/+$/, '');

    return cleaned;
}

/**
 * 環境変数の値を安全に取得する（Markdownリンク記法の混入対策）
 */
function getCleanEnvUrl(envValue: string | undefined): string {
    if (!envValue) return '';
    return normalizeUrl(envValue);
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

    // 公開URL（環境変数のMarkdown記法混入・URL破損対策として正規化）
    const publicUrl = getCleanEnvUrl(process.env.R2_CONTENT_PUBLIC_URL);
    const fileUrl = `${publicUrl}/${key}`;

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

