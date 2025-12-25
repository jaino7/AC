export default function FansTermsPage() {
    return (
        <div className="min-h-screen bg-white px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">利用規約</h1>
                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <p>
                        この利用規約（以下「本規約」といいます。）は、CocoBa運営事務局（以下「当運営」といいます。）が提供するプラットフォーム「CocoBa」および同システムを利用して開設されたクリエイターのウェブサイト（以下、総称して「本サービス」といいます。）を利用するすべてのユーザー（以下「利用者」といいます。）に適用されます。
                    </p>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第1条（適用）</h2>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>本規約は、本サービスの利用に関する当運営と利用者との間の権利義務関係を定めることを目的とし、利用者と当運営との間の本サービスの利用に関わる一切の関係に適用されます。</li>
                            <li>本サービス内で、個別のクリエイターが独自に定めるルールや注意事項がある場合、それらも本規約の一部を構成するものとしますが、本規約と矛盾がある場合は本規約が優先されます。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第2条（年齢制限と利用資格）</h2>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>本サービスは、満18歳以上の者（高校生を除く）のみが利用できます。</li>
                            <li>18歳未満の者は、会員登録、コンテンツの閲覧、購入など、本サービスの一切を利用することができません。</li>
                            <li>利用者は、本サービスの利用にあたり、当運営が年齢確認を求めた場合には、運転免許証等の公的証明書を提示することに同意するものとします。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第3条（アカウント登録）</h2>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>利用者は、自身の責任において、本サービスのアカウント情報（IDおよびパスワード）を適切に管理および保管するものとします。</li>
                            <li>アカウントを第三者に利用させたり、貸与、譲渡、名義変更、売買等をすることはできません。</li>
                            <li>当運営は、ログイン時に入力されたIDとパスワードが登録されたものと一致することを確認した場合、その利用を当該利用者本人による利用とみなします。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第4条（コンテンツの購入と支払い）</h2>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>利用者は、本サービス内で提供される有料コンテンツまたはサブスクリプション（以下「有料サービス」）を購入する場合、当運営が定める金額を支払うものとします。</li>
                            <li>支払方法は銀行振込のみとします。利用者は、購入申し込み後、当運営が指定する期日までに指定口座へ代金を振り込むものとします。なお、振込手数料は利用者の負担とします。</li>
                            <li>デジタルコンテンツという商品の性質上、<strong>購入完了（振込完了）後の返品、キャンセル、返金は一切お受けできません。</strong>ただし、本サービスの不具合によりコンテンツが閲覧できない等の場合はこの限りではありません。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第5条（禁止事項）</h2>
                        <p className="mb-3">
                            利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。違反した場合、事前の通知なくアカウントの停止や法的措置を講じることがあります。
                        </p>
                        <ol className="list-decimal space-y-3 pl-6">
                            <li>
                                <strong>コンテンツの無断転載・再配布</strong>
                                <br />
                                本サービス内の画像、動画、音声、文章等を、SNS、動画共有サイト、掲示板、クラウドストレージ等へ無断でアップロード、転載、販売する行為。
                            </li>
                            <li>
                                <strong>クリエイターへの迷惑行為</strong>
                                <br />
                                クリエイターに対する誹謗中傷、脅迫、ストーカー行為、名誉毀損、執拗な連絡、プライバシーを侵害する行為。
                            </li>
                            <li>
                                <strong>不正利用</strong>
                                <br />
                                他人のアカウントを使用する行為、または自分以外のアカウントを作成させる行為。
                            </li>
                            <li>
                                <strong>スクリーンショット・画面録画</strong>
                                <br />
                                有料コンテンツが表示されている画面をスクリーンショットや画面録画機能を用いて保存する行為（個人的な利用の範囲を超えて流出させる目的が疑われる場合を含みます）。
                            </li>
                            <li>
                                <strong>法令違反</strong>
                                <br />
                                法令に違反する行為、または犯罪行為に関連する行為。
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第6条（権利の帰属）</h2>
                        <p>
                            本サービスに含まれる一切のコンテンツ（画像、動画、テキスト、プログラム等）の著作権およびその他の知的財産権は、当該コンテンツを投稿したクリエイターまたは<strong>当運営</strong>に帰属します。利用者は、個人的な視聴・閲覧の範囲を超えてこれらを利用することはできません。
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第7条（免責事項）</h2>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>当運営は、各クリエイターが提供するコンテンツの内容の正確性、適法性、道徳性について、完全な保証を行うものではありません。</li>
                            <li>利用者とクリエイター、または利用者同士の間で生じたトラブル（個人的な金銭トラブル、メッセージのやり取り等）について、当運営は一切の責任を負いません。</li>
                            <li>システムメンテナンス、通信回線の不具合、停電、天災地変等により本サービスの提供が中断・停止した場合に利用者が被った損害について、当運営は責任を負いません。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第8条（サービスの変更・終了）</h2>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li><strong>当運営の都合</strong>により、本サービスの内容を変更し、または提供を終了することができます。</li>
                            <li>当運営が本サービスの提供を終了する場合、当運営は利用者に事前に通知するものとします。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第9条（準拠法・裁判管轄）</h2>
                        <p>
                            本規約の解釈にあたっては日本法を準拠法とします。本サービスに関して紛争が生じた場合には、<strong>当運営の所在地</strong>を管轄する裁判所を専属的合意管轄とします。
                        </p>
                    </section>

                    <div className="mt-12 border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-500">最終更新日: 2025年12月25日</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
