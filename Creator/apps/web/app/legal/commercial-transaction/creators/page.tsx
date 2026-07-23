export default function CreatorsCommercialTransactionPage() {
    return (
        <div className="min-h-screen bg-white px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">特定商取引法に基づく表記</h1>
                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">販売業者</h2>
                        <p>CocoBa運営事務局</p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">代表責任者</h2>
                        <p>猪股俊介</p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">所在地</h2>
                        <p>お客様からのご請求により情報の提供を遅滞なく行います。情報の開示をご希望される場合は、下記お問い合わせ先（メールアドレス）までご連絡ください。</p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">電話番号</h2>
                        <p>080-1845-6949</p>
                        <p className="mt-1 text-sm text-gray-600">※お電話でのサポートは行っておりません。お問い合わせはメールにてお願いいたします。</p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">メールアドレス</h2>
                        <p>ownstage3m@gmail.com</p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">お問い合わせフォーム</h2>
                        <p><a href="/contact" className="text-blue-600 hover:underline">/contact</a></p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">販売価格</h2>
                        <p>各プランの紹介ページに記載している価格とします。</p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">商品代金以外の必要料金</h2>
                        <ul className="list-disc space-y-1 pl-6">
                            <li>銀行振込手数料</li>
                            <li>インターネット接続料金その他の電気通信回線の通信に関する費用</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">支払方法</h2>
                        <p>銀行振込（当運営が指定する仮想口座への入金）</p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">商品引渡し時期</h2>
                        <ul className="list-disc space-y-2 pl-6">
                            <li><strong>無料プラン：</strong> 利用登録完了後、直ちにご利用いただけます。</li>
                            <li><strong>有料プラン：</strong> 当運営にてご入金を確認後、24時間以内にアカウントを有効化、またはコンテンツを閲覧可能な状態にします。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">返品・キャンセルについて</h2>
                        <p>本サービスはデジタルコンテンツとしての性質上、ご入金後のキャンセル・返金はお受けしておりません。</p>
                    </section>

                    <div className="mt-12 border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-500">最終更新日: 2026年2月18日</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
