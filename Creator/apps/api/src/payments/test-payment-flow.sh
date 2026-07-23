#!/bin/bash

# 支払いフローの統合テストスクリプト
# 使い方: ./test-payment-flow.sh

set -e

BASE_URL="http://localhost:3000"
CREATOR_ID="YOUR_CREATOR_ID_HERE"  # 実際のクリエイターIDに置き換え
AUTOMATION_SECRET="your-automation-webhook-secret"  # .envのAUTOMATION_WEBHOOK_SECRETと同じ値

echo "========================================="
echo "支払いフロー統合テスト"
echo "========================================="

# ステップ1: ChargeRequestを作成
echo ""
echo "[1/4] ChargeRequestを作成中..."
CHARGE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/payments/charge" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 1000,
    \"creatorId\": \"$CREATOR_ID\"
  }")

echo "レスポンス:"
echo "$CHARGE_RESPONSE" | jq '.'

# レスポンスから口座番号を抽出
ACCOUNT_NUMBER=$(echo "$CHARGE_RESPONSE" | jq -r '.virtualAccount.accountNumber')
CHARGE_REQUEST_ID=$(echo "$CHARGE_RESPONSE" | jq -r '.chargeRequestId')

if [ "$ACCOUNT_NUMBER" == "null" ] || [ -z "$ACCOUNT_NUMBER" ]; then
  echo "エラー: ChargeRequest作成に失敗しました"
  exit 1
fi

echo "✓ ChargeRequest作成成功"
echo "  - ChargeRequest ID: $CHARGE_REQUEST_ID"
echo "  - 口座番号: $ACCOUNT_NUMBER"

# ステップ2: バーチャル口座在庫確認
echo ""
echo "[2/4] バーチャル口座在庫を確認中..."
INVENTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/webhooks/virtual-accounts/inventory")

echo "在庫状況:"
echo "$INVENTORY_RESPONSE" | jq '.'

# ステップ3: 5秒待機（オプション）
echo ""
echo "[3/4] Webhook送信まで5秒待機..."
sleep 5

# ステップ4: Webhookシミュレーション
echo ""
echo "[4/4] Webhookシミュレーションを送信中..."
WEBHOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/webhooks/automation/bank-transfer" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $AUTOMATION_SECRET" \
  -d "{
    \"accountNumber\": \"$ACCOUNT_NUMBER\",
    \"amount\": 1000,
    \"transferorName\": \"ヤマダタロウ\",
    \"transferDate\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\"
  }")

echo "Webhookレスポンス:"
echo "$WEBHOOK_RESPONSE" | jq '.'

WEBHOOK_SUCCESS=$(echo "$WEBHOOK_RESPONSE" | jq -r '.success')

if [ "$WEBHOOK_SUCCESS" == "true" ]; then
  echo ""
  echo "========================================="
  echo "✓ 支払いフローテスト成功"
  echo "========================================="
  echo ""
  echo "次のステップ:"
  echo "1. データベースでFanProfileのクレジット残高を確認"
  echo "2. CreditHistoryテーブルでチャージ履歴を確認"
  echo "3. ChargeRequestのステータスがAPPROVEDになっているか確認"
  echo "4. VirtualAccountのisUsedがfalseに戻っているか確認"
else
  echo ""
  echo "========================================="
  echo "✗ Webhook処理に失敗しました"
  echo "========================================="
  exit 1
fi
