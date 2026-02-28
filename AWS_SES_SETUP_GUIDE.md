# AWS SES セットアップガイド

## 📧 概要

このガイドでは、AWS Simple Email Service (SES) を使用して本番環境でメール送信を行うための設定方法を説明します。

---

## 🔧 あなたがやること

### 1. AWS アカウントの準備

1. **AWS アカウントにログイン**
   - https://aws.amazon.com/jp/
   - まだアカウントがない場合は新規作成

### 2. AWS SES の設定

#### 2.1 リージョンの選択
1. AWS コンソールで **東京リージョン (ap-northeast-1)** を選択
2. SES サービスに移動

#### 2.2 送信元メールアドレスの認証

**オプション A: ドメイン認証（推奨）**
1. SES コンソール → **Verified identities** → **Create identity**
2. **Domain** を選択
3. ドメイン名を入力（例: `cocoba.com`）
4. **DomainKeys Identified Mail (DKIM)** にチェック
5. DNS レコードが表示される
6. DNS プロバイダー（Porkbun等）で以下を追加:
   - TXT レコード（ドメイン所有権確認用）
   - CNAME レコード（DKIM署名用、3つ）
7. 認証完了まで待機（通常15分〜24時間）

**オプション B: メールアドレス認証（テスト用）**
1. SES コンソール → **Verified identities** → **Create identity**
2. **Email address** を選択
3. メールアドレスを入力（例: `noreply@cocoba.com`）
4. 確認メールが送信されるのでリンクをクリック

#### 2.3 サンドボックスからの解放

**重要**: デフォルトではSESは「サンドボックスモード」で、認証済みアドレスにしか送信できません。

本番環境で任意のユーザーにメール送信するには:

1. SES コンソール → **Account dashboard**
2. **Request production access** をクリック
3. フォームに記入:
   - **Mail type**: Transactional
   - **Website URL**: あなたのサイトURL
   - **Use case description**:
     ```
     We are running a creator platform where creators can sell content to fans.
     We need to send transactional emails such as:
     - Welcome emails
     - Password reset emails
     - Purchase confirmation emails
     - Payment instruction emails

     We follow email best practices and have proper unsubscribe mechanisms.
     ```
   - **Compliance**: 利用規約を確認してチェック
4. **Submit request**
5. AWS サポートからの承認を待つ（通常24時間以内）

### 3. IAM ユーザーの作成（セキュリティベストプラクティス）

1. IAM コンソールに移動
2. **Users** → **Create user**
3. ユーザー名: `cocoba-ses-sender`
4. **Next** → **Attach policies directly**
5. **AmazonSESFullAccess** ポリシーを選択
   - または、より制限的なカスタムポリシー:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ses:SendEmail",
           "ses:SendRawEmail"
         ],
         "Resource": "*"
       }
     ]
   }
   ```
6. **Create user**
7. ユーザー詳細画面 → **Security credentials** タブ
8. **Create access key** → **Application running outside AWS** を選択
9. **Access key ID** と **Secret access key** をメモ（後で使用）

### 4. 環境変数の設定

#### 開発環境 (`.env.local`)
開発中はログのみ:
```bash
MAIL_PROVIDER=DEV
```

#### 本番環境
本番サーバーで以下を設定:

```bash
# メールプロバイダーをSESに変更
MAIL_PROVIDER=SES

# AWS SES 設定
AWS_REGION=ap-northeast-1
AWS_SES_FROM_EMAIL=noreply@cocoba.com  # 認証済みのメールアドレス
AWS_ACCESS_KEY_ID=AKIA...  # IAMユーザーのアクセスキー
AWS_SECRET_ACCESS_KEY=xxxxx...  # IAMユーザーのシークレットキー
```

**⚠️ 重要**: シークレットキーは絶対にGitにコミットしない！

### 5. 動作確認

#### 5.1 ローカルテスト
```bash
cd apps/api
npm run test:mail  # テストスクリプトがあれば
```

または直接APIを叩く:
```bash
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

#### 5.2 SES送信統計の確認
1. SES コンソール → **Account dashboard**
2. 送信統計を確認:
   - Sends
   - Bounces（バウンス率）
   - Complaints（苦情率）

---

## 📊 運用上の注意点

### バウンス・苦情率の監視
- **バウンス率**: 5% 以下を維持
- **苦情率**: 0.1% 以下を維持
- これらを超えると送信が制限される可能性あり

### 送信制限
- 初期: **1通/秒、200通/日**
- 自動的に増加するが、必要に応じてサポートに増量リクエスト可能

### DKIM/SPF設定
- **DKIM**: ドメイン認証時に自動設定
- **SPF**: DNS に以下を追加（推奨）:
  ```
  Type: TXT
  Name: @
  Value: v=spf1 include:amazonses.com ~all
  ```

### メール内容のベストプラクティス
- ✅ 配信停止リンクを含める
- ✅ 件名は具体的に
- ✅ HTMLとプレーンテキストの両方を含める（現在はHTML のみ）
- ✅ 送信元アドレスは noreply@ 等の明確なもの

---

## 🔍 トラブルシューティング

### メールが届かない

**1. サンドボックスモードを確認**
```bash
# SES コンソールで確認
Account dashboard → Production access status
```

**2. ログを確認**
```bash
# アプリケーションログ
tail -f apps/api/logs/application.log

# EmailLogテーブルを確認
prisma studio
```

**3. SES送信ログを確認**
- CloudWatch Logs でSESのログを確認
- バウンスやエラーの詳細を確認

### 認証エラー

```
Error: The security token included in the request is invalid
```
→ IAM アクセスキーを確認

```
Error: Email address is not verified
```
→ 送信元メールアドレスを認証

### 送信制限エラー

```
Error: Maximum sending rate exceeded
```
→ 送信レート制限に達しています。AWS サポートに増量リクエスト

---

## 📝 チェックリスト

実装完了前に確認:

- [ ] AWS SES でドメインまたはメールアドレスを認証済み
- [ ] DNS レコード（DKIM/SPF）を設定済み
- [ ] サンドボックスから本番アクセスへの移行申請を承認済み
- [ ] IAM ユーザーを作成し、アクセスキーを取得済み
- [ ] 環境変数を設定済み（本番環境）
- [ ] テストメールが正常に送信されることを確認
- [ ] EmailLog テーブルでステータスを確認
- [ ] バウンス・苦情の通知設定（SNS）を検討

---

## 💰 料金

AWS SES の料金:
- **送信**: 1,000通あたり $0.10
- **受信**: 1,000通あたり $0.10
- **無料枠**: 62,000通/月（EC2/Lambda等から送信する場合）

月10万通送信の場合: 約 $10/月

---

## 📚 参考リンク

- [AWS SES 公式ドキュメント](https://docs.aws.amazon.com/ses/)
- [SES サンドボックスからの移行](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [DKIM署名の設定](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dkim.html)
- [バウンス・苦情の処理](https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity.html)

---

## ✅ 実装完了

実装は完了しています。上記の手順に従ってAWSを設定するだけです！

環境変数を `MAIL_PROVIDER=SES` に変更すると、本番メール送信が有効になります。
