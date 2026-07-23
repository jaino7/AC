/**
 * 次回の請求日（1ヶ月後または1年後）を計算します。
 * 月払いの際、31日に入会して翌月が28日（または30日）までしかない場合、その月の末日を返すように補正します。
 * 
 * @param fromDate 起点となる日付
 * @param isYearly 年払いかどうか（true: 1年後, false: 1ヶ月後）
 * @returns 次回請求日（Dateオブジェクト）
 */
export function calculateNextBillingDate(fromDate: Date, isYearly: boolean): Date {
    const nextDate = new Date(fromDate);

    if (isYearly) {
        // 閏年（2月29日）の1年後が平年の場合、自動的に3月1日か2月28日になる挙動を制御
        // 基本は setFullYear で問題ないが、2月29日の場合は2月28日にする
        const isLeapDay = nextDate.getMonth() === 1 && nextDate.getDate() === 29;
        nextDate.setFullYear(nextDate.getFullYear() + 1);

        if (isLeapDay && nextDate.getMonth() === 2) {
            // 3月1日に押し出された場合は2月28日に戻す
            nextDate.setDate(0);
        }
    } else {
        // 月払い: 1ヶ月後
        const originalDate = nextDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + 1);

        // 日付がずれた場合（例: 1月31日 -> 2月28日ではなく3月3日になってしまった場合等）
        // nextDate.getDate() が originalDate と異なる場合は末日オーバーフローが発生している
        if (nextDate.getDate() !== originalDate) {
            // 日付を0に設定すると、その月の前日（前月の末日）に戻る
            nextDate.setDate(0);
        }
    }

    return nextDate;
}
