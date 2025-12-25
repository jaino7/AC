export default function CreatorsTermsPage() {
    return (
        <div className="min-h-screen bg-white px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">利用規約</h1>
                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <p>
                        この利用規約（以下「本規約」といいます。）は、<strong>CocoBa運営事務局（以下「当運営」といいます。）</strong>が提供するクリエイター向けプラットフォームサービス「CocoBa」（以下「本サービス」といいます。）の利用条件を定めるものです。本サービスを利用するすべてのユーザー（以下「利用者」といいます。）は、本規約に同意したものとみなされます。
                    </p>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第1条（適用）</h2>
                        <p>
                            本規約は、利用者と当運営との間の本サービスの利用に関わる一切の関係に適用されるものとします。
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第2条（利用資格・年齢制限）</h2>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>本サービスは、満18歳以上の者のみが利用できるものとします。18歳未満の者は、本サービスの登録および利用を行うことができません。</li>
                            <li>利用者は、登録時に年齢確認書類の提出を求められる場合があり、これに応じるものとします。提出された書類に不備や虚偽がある場合、利用を制限することがあります。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第3条（利用登録）</h2>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>利用登録希望者が当運営の定める方法によって利用登録を申請し、当運営がこれを承認することによって、利用登録が完了するものとします。</li>
                            <li>
                                当運営は、以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
                                <ul className="mt-2 list-disc space-y-1 pl-6">
                                    <li>年齢が18歳未満である場合</li>
                                    <li>登録事項に虚偽、誤記または記載漏れがあった場合</li>
                                    <li>過去に本規約違反等により利用停止処分を受けている場合</li>
                                    <li>その他、当運営が利用登録を相当でないと判断した場合</li>
                                </ul>
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第4条（禁止事項）</h2>
                        <p className="mb-3">利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>日本国の法令または公序良俗に違反する行為</li>
                            <li>犯罪行為に関連する行為</li>
                            <li>刑法175条（わいせつ物頒布等）に抵触するコンテンツ、児童ポルノ、無修正ポルノ、盗撮、リベンジポルノ等を投稿・販売・配信する行為</li>
                            <li>他人の著作権、肖像権、プライバシー権等の権利を侵害する行為</li>
                            <li>本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
                            <li><strong>当運営のサービスの運営を妨害するおそれのある行為</strong></li>
                            <li>詐欺的な行為、または資金洗浄（マネーロンダリング）を目的とした行為</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第5条（利用料金および支払い）</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">1. 利用料金</h3>
                                <p>利用者は、本サービス利用の対価として、別途当運営が定め本ウェブサイトに表示する利用料金（月額費用、プラン料金等）を支払うものとします。</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">2. 支払方法</h3>
                                <p>前項の支払方法は銀行振込のみとします。利用者は、当運営が指定する銀行口座へ、当運営が定める期日までに入金を行うものとします。なお、振込手数料は利用者の負担とします。</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">3. 売上の回収代行</h3>
                                <p>当運営は、利用者が本サービス上でファンに対して販売したコンテンツの代金（以下「販売代金」といいます）を、利用者に代わって受領（回収代行）するものとします。</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">4. 売上の精算</h3>
                                <p>当運営は、前項により受領した販売代金から、利用者が選択したプランごとに定める<strong>サービス利用手数料を差し引いた金額</strong>（以下「支払対象額」といいます）を、利用者に対して支払うものとします。</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">5. 支払時期と最低振込金額</h3>
                                <p>前項の支払対象額の支払いは、売上が発生した月の翌月末日に、利用者が指定する銀行口座へ振り込む方法により行います。ただし、<strong>支払対象額が5,000円（消費税別）に満たない場合は、次月以降の支払日に繰り延べるものとします。</strong></p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">6. 振込手数料の負担</h3>
                                <p>当運営から利用者への支払いにかかる銀行振込手数料は、<strong>利用者の負担</strong>（支払対象額から差し引き）とします。</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">7. 遅延損害金</h3>
                                <p>利用者が当運営に対する支払いを遅滞した場合、利用者は年14.6％の割合による遅延損害金を支払うものとします。</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第6条（データの管理・削除）</h2>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>当運営は、利用者が本サービスを通じてアップロードしたデータについて、法令違反や本規約違反が疑われる場合（特に第4条第3項に関連するもの）、事前の通知なく当該データを閲覧、削除、または公開停止にする権利を有します。</li>
                            <li>システムの保守点検、障害復旧等のため、当運営が必要と判断した場合には、事前の通知なく本サービスの全部または一部の提供を停止または中断することができるものとします。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第7条（免責事項）</h2>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li>当運営は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。</li>
                            <li>当運営は、本サービスに起因して利用者に生じたあらゆる損害について、当運営の故意または重過失による場合を除き、一切の責任を負いません。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">第8条（準拠法・裁判管轄）</h2>
                        <p>
                            本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、<strong>当運営の所在地を管轄する裁判所</strong>を専属的合意管轄とします。
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
