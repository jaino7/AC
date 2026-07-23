"use client";

import { useState } from "react";
import Link from "next/link";

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  requiredAmount: number;
  handle?: string;
  contentTitle?: string;
}

export function InsufficientCreditsModal({
  isOpen,
  onClose,
  currentCredits,
  requiredAmount,
  handle,
  contentTitle,
}: InsufficientCreditsModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen && !isClosing) return null;

  const shortage = Math.max(0, requiredAmount - currentCredits);
  const creditsUrl = handle ? `/${handle}/account/credits` : "/account/credits";

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl bg-white shadow-xl transition-transform duration-200 ${
          isClosing ? "scale-95" : "scale-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <svg
                    className="h-5 w-5 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">クレジット不足</h2>
              </div>
              {contentTitle && (
                <p className="text-sm text-gray-600">「{contentTitle}」の購入には、さらにクレジットが必要です。</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Credits Info */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">現在の保有クレジット</span>
                <span className="text-lg font-semibold text-gray-900 inline-flex items-center gap-1">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  {currentCredits.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">必要金額</span>
                <span className="text-lg font-semibold text-gray-900 inline-flex items-center gap-1">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  {requiredAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">不足金額</span>
                  <span className="text-xl font-bold text-orange-600 inline-flex items-center gap-1">
                    <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    {shortage.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex gap-3">
              <svg
                className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">
                  クレジットのチャージ方法
                </p>
                <p className="text-sm text-blue-800">
                  銀行振込でクレジットをチャージできます。振込確認後、通常1〜3営業日以内にクレジットが反映されます。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex flex-col gap-3">
            <Link
              href={creditsUrl}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              クレジットをチャージする
            </Link>
            <button
              onClick={handleClose}
              className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
