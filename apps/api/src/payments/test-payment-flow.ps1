# 支払いフローの統合テストスクリプト（PowerShell版）
# 使い方: .\test-payment-flow.ps1

$ErrorActionPreference = "Stop"

$BASE_URL = "http://localhost:3001"
$CREATOR_ID = "cml35joec0002vjvc0eyvn84d"  # テストで作成したクリエイターID
$AUTOMATION_SECRET = "9efe772e22e351780cef6faa544c084ffe944da22d7a5eed92102c41ec9c3c51"  # .envのAUTOMATION_WEBHOOK_SECRETと同じ値

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "支払いフロー統合テスト" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# ステップ1: ChargeRequestを作成
Write-Host ""
Write-Host "[1/4] ChargeRequestを作成中..." -ForegroundColor Yellow

$chargeBody = @{
    amount = 1000
    creatorId = $CREATOR_ID
} | ConvertTo-Json

try {
    $chargeResponse = Invoke-RestMethod -Uri "$BASE_URL/api/payments/charge" `
        -Method Post `
        -ContentType "application/json" `
        -Body $chargeBody

    Write-Host "レスポンス:" -ForegroundColor Green
    $chargeResponse | ConvertTo-Json -Depth 5

    $accountNumber = $chargeResponse.virtualAccount.accountNumber
    $chargeRequestId = $chargeResponse.chargeRequestId

    if (-not $accountNumber) {
        Write-Host "エラー: ChargeRequest作成に失敗しました" -ForegroundColor Red
        exit 1
    }

    Write-Host "✓ ChargeRequest作成成功" -ForegroundColor Green
    Write-Host "  - ChargeRequest ID: $chargeRequestId"
    Write-Host "  - 口座番号: $accountNumber"
}
catch {
    Write-Host "エラー: $_" -ForegroundColor Red
    exit 1
}

# ステップ2: バーチャル口座在庫確認
Write-Host ""
Write-Host "[2/4] バーチャル口座在庫を確認中..." -ForegroundColor Yellow

try {
    $inventoryResponse = Invoke-RestMethod -Uri "$BASE_URL/webhooks/virtual-accounts/inventory" `
        -Method Get

    Write-Host "在庫状況:" -ForegroundColor Green
    $inventoryResponse | ConvertTo-Json -Depth 5
}
catch {
    Write-Host "警告: 在庫確認に失敗しました - $_" -ForegroundColor Yellow
}

# ステップ3: 5秒待機
Write-Host ""
Write-Host "[3/4] Webhook送信まで5秒待機..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# ステップ4: Webhookシミュレーション
Write-Host ""
Write-Host "[4/4] Webhookシミュレーションを送信中..." -ForegroundColor Yellow

$webhookBody = @{
    accountNumber = $accountNumber
    amount = 1000
    transferorName = "ヤマダタロウ"
    transferDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-Webhook-Secret" = $AUTOMATION_SECRET
}

try {
    $webhookResponse = Invoke-RestMethod -Uri "$BASE_URL/webhooks/automation/bank-transfer" `
        -Method Post `
        -Headers $headers `
        -Body $webhookBody

    Write-Host "Webhookレスポンス:" -ForegroundColor Green
    $webhookResponse | ConvertTo-Json -Depth 5

    if ($webhookResponse.success -eq $true) {
        Write-Host ""
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host "✓ 支払いフローテスト成功" -ForegroundColor Green
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "次のステップ:" -ForegroundColor Cyan
        Write-Host "1. データベースでFanProfileのクレジット残高を確認"
        Write-Host "2. CreditHistoryテーブルでチャージ履歴を確認"
        Write-Host "3. ChargeRequestのステータスがAPPROVEDになっているか確認"
        Write-Host "4. VirtualAccountのisUsedがfalseに戻っているか確認"
    }
    else {
        Write-Host ""
        Write-Host "=========================================" -ForegroundColor Red
        Write-Host "✗ Webhook処理に失敗しました" -ForegroundColor Red
        Write-Host "=========================================" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "エラー: $_" -ForegroundColor Red
    exit 1
}
