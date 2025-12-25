import { z } from "zod";

export const creatorLoginSchema = z.object({
  email: z.string().email("正しいメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください")
});

export type CreatorLoginInput = z.infer<typeof creatorLoginSchema>;
