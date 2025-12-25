import { z } from "zod";

export const creatorSignupSchema = z
  .object({
    email: z.string().email("正しいメールアドレスを入力してください"),
    password: z
      .string()
      .min(8, "パスワードは8文字以上で設定してください")
      .regex(/[a-zA-Z]/, "英字（大文字または小文字）を含めてください")
      .regex(/\d/, "数字を含めてください"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "利用規約への同意が必要です" })
    }),
    confirmAdult: z.literal(true, {
      errorMap: () => ({ message: "成人である確認が必要です" })
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"]
  });

export type CreatorSignupInput = z.infer<typeof creatorSignupSchema>;
