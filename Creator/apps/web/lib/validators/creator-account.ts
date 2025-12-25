import { z } from "zod";

export const creatorAccountSchema = z.object({
    username: z.string().min(1, "ユーザー名を入力してください"),
    email: z.string().email("正しいメールアドレスを入力してください").optional(), // Email might be read-only or optional to update
    bio: z.string().max(160, "自己紹介は160文字以内で入力してください").optional()
});

export type CreatorAccountInput = z.infer<typeof creatorAccountSchema>;
