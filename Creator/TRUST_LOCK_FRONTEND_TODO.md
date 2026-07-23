# Trust & Lock System - Frontend Implementation Guide

## Overview

バックエンドの実装は完了しました。以下のフロントエンド実装が必要です。

## 必要なフロントエンド実装

### 1. ファン向けUI

#### 1.1 クレジットチャージページ (`apps/web/app/[handle]/account/credits/page.tsx`)

**現在の状態を確認:**
```bash
# ファイルの確認
cat apps/web/app/[handle]/account/credits/page.tsx
```

**追加する機能:**
1. 「振込完了を申告」ボタンをChargeRequest作成後に表示
2. ボタンクリック時にClaimWarningModalを表示
3. 確定後に`POST /api/payments/claims`を呼び出し

**実装例:**
```typescript
// ChargeRequest作成後
const [chargeRequest, setChargeRequest] = useState(null);
const [showClaimModal, setShowClaimModal] = useState(false);

const handleCreateClaim = async () => {
  try {
    const response = await fetch('/api/payments/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chargeRequestId: chargeRequest.id,
        creatorId: creatorId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert(result.message); // または toast notification
      // クレジット残高を更新
      refreshCredits();
    }
  } catch (error) {
    console.error('Failed to create claim:', error);
  }
};

return (
  <>
    {chargeRequest && (
      <button
        onClick={() => setShowClaimModal(true)}
        className="btn btn-primary"
      >
        振込完了を申告
      </button>
    )}

    <ClaimWarningModal
      isOpen={showClaimModal}
      onClose={() => setShowClaimModal(false)}
      onConfirm={handleCreateClaim}
      amount={chargeRequest?.amount}
      tier={fanProfile.tier}
    />
  </>
);
```

#### 1.2 ClaimWarningModal コンポーネント (`apps/web/components/credits/ClaimWarningModal.tsx`)

**作成:**
```typescript
import { AlertTriangle } from 'lucide-react';

interface ClaimWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  tier: number;
}

export function ClaimWarningModal({
  isOpen,
  onClose,
  onConfirm,
  amount,
  tier,
}: ClaimWarningModalProps) {
  if (!isOpen) return null;

  // Calculate immediate vs pending credits
  let immediateCredit = 0;
  let pendingCredit = amount;

  if (tier === 1) {
    immediateCredit = Math.min(amount, 3000);
    pendingCredit = Math.max(amount - 3000, 0);
  } else if (tier >= 2) {
    immediateCredit = amount;
    pendingCredit = 0;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-500" size={24} />
          <h2 className="text-xl font-bold">振込完了の申告</h2>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="text-red-800 font-semibold mb-2">
            ⚠️ 重要な警告
          </p>
          <p className="text-sm text-red-700">
            虚偽の申告を行った場合、アカウントがロックされ、すべてのコンテンツにアクセスできなくなります。
          </p>
        </div>

        <div className="mb-4 space-y-2">
          <h3 className="font-semibold">クレジット付与について:</h3>
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between mb-1">
              <span className="text-sm">即時付与:</span>
              <span className="font-bold text-green-600">
                ¥{immediateCredit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">振込確認後:</span>
              <span className="font-bold text-orange-600">
                ¥{pendingCredit.toLocaleString()}
              </span>
            </div>
          </div>
          {tier === 0 && (
            <p className="text-xs text-gray-600">
              初回のため、振込確認後に全額付与されます
            </p>
          )}
          {tier === 1 && (
            <p className="text-xs text-gray-600">
              3,000円まで即座に利用可能です
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            申告する
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 1.3 AccountLockedScreen コンポーネント (`apps/web/components/AccountLockedScreen.tsx`)

**作成:**
```typescript
import { Lock } from 'lucide-react';

interface AccountLockedScreenProps {
  reason: string;
  lockedAt: Date;
}

export function AccountLockedScreen({
  reason,
  lockedAt,
}: AccountLockedScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Lock className="mx-auto text-red-500" size={64} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          アカウントがロックされています
        </h1>

        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-sm font-semibold text-red-800 mb-2">
            ロックの理由:
          </p>
          <p className="text-sm text-red-700">{reason}</p>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          ロック日時: {new Date(lockedAt).toLocaleString('ja-JP')}
        </p>

        <p className="text-sm text-gray-600 mb-6">
          このアカウントではコンテンツにアクセスできません。
        </p>

        <a
          href="mailto:support@cocoba.jp"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          サポートに問い合わせる
        </a>
      </div>
    </div>
  );
}
```

#### 1.4 投稿アクセス時のロックチェック (`apps/web/app/api/posts/[id]/route.ts`)

**追加するコード:**
```typescript
// fanProfileの取得後
if (fanProfile?.isLocked) {
  return NextResponse.json(
    {
      error: "アカウントがロックされています",
      lockedReason: fanProfile.lockedReason,
      contactSupport: true,
    },
    { status: 403 }
  );
}
```

**フロントエンドでの処理:**
```typescript
// 投稿詳細ページで
const response = await fetch(`/api/posts/${postId}`);

if (response.status === 403) {
  const error = await response.json();
  if (error.contactSupport) {
    // AccountLockedScreenを表示
    return <AccountLockedScreen reason={error.lockedReason} />;
  }
}
```

### 2. 管理者向けダッシュボード

#### 2.1 申告管理ページ (`apps/web/app/admin/claims/page.tsx`)

**作成:**
```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ClaimsAdminPage() {
  const [stats, setStats] = useState(null);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [lockedAccounts, setLockedAccounts] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchPendingClaims();
    fetchLockedAccounts();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/admin/claims/stats');
    setStats(await res.json());
  };

  const fetchPendingClaims = async () => {
    const res = await fetch('/api/admin/claims/pending');
    setPendingClaims(await res.json());
  };

  const fetchLockedAccounts = async () => {
    const res = await fetch('/api/admin/claims/locked-accounts');
    setLockedAccounts(await res.json());
  };

  const handleApproveClaim = async (claimId: string) => {
    const res = await fetch(`/api/admin/claims/${claimId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'ADMIN_USER_ID' }), // TODO: Get from auth
    });

    if (res.ok) {
      fetchPendingClaims();
      fetchStats();
    }
  };

  const handleRejectClaim = async (claimId: string, reason: string) => {
    const res = await fetch(`/api/admin/claims/${claimId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: 'ADMIN_USER_ID', // TODO: Get from auth
        reason,
      }),
    });

    if (res.ok) {
      fetchPendingClaims();
      fetchLockedAccounts();
      fetchStats();
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">申告管理</h1>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard title="保留中" value={stats.claims.pending} />
          <StatCard title="承認済み" value={stats.claims.verified} />
          <StatCard title="却下" value={stats.claims.rejected} />
          <StatCard title="不正率" value={stats.claims.fraudRate} />
        </div>
      )}

      {/* Pending Claims Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">保留中の申告</h2>
        <PendingClaimsTable
          claims={pendingClaims}
          onApprove={handleApproveClaim}
          onReject={handleRejectClaim}
        />
      </div>

      {/* Locked Accounts Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">ロックされたアカウント</h2>
        <LockedAccountsTable accounts={lockedAccounts} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function PendingClaimsTable({ claims, onApprove, onReject }) {
  // TODO: Implement table with approve/reject buttons
  return <div>TODO: Implement table</div>;
}

function LockedAccountsTable({ accounts }) {
  // TODO: Implement table
  return <div>TODO: Implement table</div>;
}
```

#### 2.2 APIプロキシルート (`apps/web/app/api/admin/claims/[...path]/route.ts`)

**作成:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams;

  const apiUrl = new URL(
    `http://localhost:3001/admin/claims/${path}`,
  );
  searchParams.forEach((value, key) => {
    apiUrl.searchParams.append(key, value);
  });

  const response = await fetch(apiUrl.toString());
  const data = await response.json();

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const body = await request.json();

  const response = await fetch(
    `http://localhost:3001/admin/claims/${path}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
```

## 実装の優先順位

### Phase 1 (必須) - ユーザー体験
1. ClaimWarningModal作成
2. クレジットチャージページに「振込完了を申告」ボタン追加
3. AccountLockedScreen作成
4. 投稿アクセス時のロックチェック追加

### Phase 2 (重要) - 管理機能
5. 管理者ダッシュボードページ作成
6. PendingClaimsTable実装
7. LockedAccountsTable実装
8. APIプロキシルート作成

### Phase 3 (改善) - UX向上
9. Toast通知の追加
10. ローディング状態の表示
11. エラーハンドリングの改善
12. ティア情報の表示

## テスト手順

### 1. ファン側のテスト

```bash
# 1. 新規ファン登録 (Tier 0)
# 2. クレジットチャージ申請
# 3. 「振込完了を申告」をクリック
# 4. モーダルで「即時付与: ¥0、保留: ¥5000」を確認
# 5. 申告を確定
# 6. クレジット残高が変わらないことを確認
# 7. バックエンドで振込を処理
# 8. クレジット残高が増えることを確認
# 9. tierが1にアップグレードされることを確認
```

### 2. Tier 1ユーザーのテスト

```bash
# 1. trustScore=1のファンでログイン
# 2. 5,000円のチャージ申請
# 3. 「振込完了を申告」をクリック
# 4. モーダルで「即時付与: ¥3,000、保留: ¥2,000」を確認
# 5. 申告を確定
# 6. クレジット残高が+3,000円増えることを確認
# 7. 投稿購入が可能なことを確認
# 8. バックエンドで振込処理
# 9. +2,000円追加されることを確認
```

### 3. 不正検知のテスト

```bash
# 1. 5,000円を申告
# 2. バックエンドで3,000円の振込を処理
# 3. アカウントがロックされることを確認
# 4. AccountLockedScreenが表示されることを確認
# 5. 投稿にアクセスできないことを確認
```

### 4. 管理者ダッシュボードのテスト

```bash
# 1. /admin/claimsにアクセス
# 2. 統計情報が表示されることを確認
# 3. 保留中の申告一覧が表示されることを確認
# 4. 申告を手動承認
# 5. ロックされたアカウント一覧を確認
# 6. アカウントのロック解除
```

## 注意点

1. **認証**: 現在、管理者認証は実装されていません。本番環境では必ず追加してください。
2. **環境変数**: バックエンドAPIのURLを環境変数で管理してください。
3. **エラーハンドリング**: ネットワークエラーや不正なレスポンスを適切に処理してください。
4. **ローディング状態**: 非同期処理中はローディングインジケーターを表示してください。
5. **アクセス制御**: AccountLockGuardを全ての重要なエンドポイントに適用してください。

## 完成の確認

以下をすべて確認できたら完成です:

- [ ] ファンが振込完了を申告できる
- [ ] Tier 1ユーザーが即時クレジットを受け取れる
- [ ] 不正検知でアカウントがロックされる
- [ ] ロックされたユーザーがコンテンツにアクセスできない
- [ ] 管理者が申告を承認/却下できる
- [ ] 管理者がアカウントをロック/解除できる
- [ ] 統計情報が正しく表示される
- [ ] Cronジョブが48時間後に申告を期限切れにする
