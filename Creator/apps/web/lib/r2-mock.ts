import { PresignedUrlRequest, PresignedUrlResponse } from "./r2";

/**
 * 開発環境用のローカルストレージ実装
 * ファイルをpublic/uploadsに保存し、実際にプレビュー可能
 */
export async function generatePresignedUrlMock(
    request: PresignedUrlRequest
): Promise<PresignedUrlResponse> {
    const fileExtension = request.filename.split(".").pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${randomStr}.${fileExtension}`;
    const mockKey = `uploads/${filename}`;

    // ローカルストレージAPIのURL
    // ファイルは public/uploads に保存され、/uploads/filename.jpg でアクセス可能
    return {
        uploadUrl: `/api/upload/local?key=${mockKey}`,
        fileUrl: `/uploads/${filename}`,
        key: mockKey,
    };
}
