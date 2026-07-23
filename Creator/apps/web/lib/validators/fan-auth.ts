import { z } from "zod";

export const fanSignupSchema = z
    .object({
        email: z.string().email("有効なメールアドレスを入力してください"),
        password: z
            .string()
            .min(8, "パスワードは8文字以上である必要があります")
            .regex(/[A-Za-z]/, "パスワードには英字を含める必要があります")
            .regex(/[0-9]/, "パスワードには数字を含める必要があります"),
        confirmPassword: z.string(),
        displayName: z.string().min(1, "表示名を入力してください").optional(),
        acceptTerms: z.literal(true, {
            errorMap: () => ({ message: "利用規約への同意が必要です" })
        }),
        confirmAdult: z.literal(true, {
            errorMap: () => ({ message: "成人確認が必要です" })
        })
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "パスワードが一致しません",
        path: ["confirmPassword"]
    });

export type FanSignupInput = z.infer<typeof fanSignupSchema>;

export const fanLoginSchema = z.object({
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z.string().min(1, "パスワードを入力してください")
});

export type FanLoginInput = z.infer<typeof fanLoginSchema>;
