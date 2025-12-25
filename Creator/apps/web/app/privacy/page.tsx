export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">プライバシーポリシー</h1>
                <div className="space-y-6 text-gray-700">
                    <p>
                        CocoBa運営事務局（以下「当運営」といいます。）は、本ウェブサイト上で提供するサービス「CocoBa」（以下「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
                    </p>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第1条（個人情報）</h2>
                        <p>
                            「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報を指します。
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第2条（個人情報の収集方法）</h2>
                        <p>
                            当運営は、ユーザーが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレス、<strong>銀行口座番号（報酬の支払いや本人確認のため）</strong>、身分証明書等の個人情報を尋ねることがあります。
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第3条（個人情報の利用目的）</h2>
                        <p className="mb-3">当運営が個人情報を収集・利用する目的は、以下のとおりです。</p>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>本サービスの提供・運営のため</li>
                            <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
                            <li>ユーザーの年齢確認および本人確認を行うため</li>
                            <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                            <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
                            <li>有料サービスにおいて、利用料金を請求するため、またはクリエイターへ収益を振り込むため</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第4条（個人情報の第三者提供）</h2>
                        <p className="mb-3">
                            当運営は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
                        </p>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                            <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第5条（お問い合わせ窓口）</h2>
                        <p className="mb-2">本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。</p>
                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="mb-1"><strong>氏名：</strong>CocoBa運営事務局</p>
                            <p><strong>Eメールアドレス：</strong>ownstage3m@gmail.com</p>
                        </div>
                    </section>

                    <div className="mt-12 border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-500">最終更新日: 2025年12月25日</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
