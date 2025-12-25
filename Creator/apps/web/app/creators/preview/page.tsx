const sources = [
  {
    id: "vid-1",
    duration: "01:23",
    color: "from-indigo-600 via-purple-600 to-pink-500",
    selected: true
  },
  {
    id: "vid-2",
    duration: "",
    color: "from-orange-300 via-amber-300 to-yellow-300",
    selected: false
  },
  {
    id: "vid-3",
    duration: "03:45",
    color: "from-cyan-400 via-sky-400 to-blue-500",
    selected: false
  },
  {
    id: "vid-4",
    duration: "",
    color: "from-emerald-400 via-teal-400 to-green-500",
    selected: false
  },
  {
    id: "vid-5",
    duration: "",
    color: "from-rose-500 via-orange-500 to-amber-500",
    selected: false
  },
  {
    id: "vid-6",
    duration: "",
    color: "from-yellow-400 via-pink-400 to-purple-500",
    selected: false
  }
];

const steps = [
  "STEP 1: ソース選択",
  "STEP 2: トリミング",
  "STEP 3: 加工・合成",
  "STEP 4: 確認と生成"
];

const filterTabs = ["コンテンツライブラリ", "アップロード"];
const quickFilters = ["All", "Videos", "Images", "Recent"];

const ContentCard = ({
  color,
  duration,
  selected
}: {
  color: string;
  duration: string;
  selected: boolean;
}) => (
  <div
    className={`relative aspect-square rounded-3xl border ${
      selected ? "border-purple-500" : "border-black/20"
    } bg-gradient-to-br ${color} p-4 text-white shadow-[0_25px_60px_rgba(0,0,0,0.25)]`}
  >
    {duration && (
      <span className="absolute left-3 bottom-3 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold">
        {duration}
      </span>
    )}
    {selected && (
      <div className="absolute inset-0 grid place-items-center">
        <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-purple-600">
          ✓
        </span>
      </div>
    )}
  </div>
);

export default function PreviewGeneratorPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="grid gap-0 lg:grid-cols-[240px,1fr]">
        <aside className="min-h-screen border-r border-black/10 bg-black/5 px-6 py-10">
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-black text-white">CS</div>
            <div>
              <p className="text-sm font-semibold">Creator Studio</p>
              <p className="text-xs text-neutral-500">Welcome Back!</p>
            </div>
          </div>

          <div className="mt-10 space-y-4 text-sm font-semibold">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  index === 0 ? "border-black bg-black text-white" : "border-black/10 text-neutral-500"
                }`}
              >
                <span>{index === 0 ? "✓" : index + 1}</span>
                {step}
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-3 text-sm font-semibold text-neutral-500">
            <button>Settings</button>
            <button>Help</button>
          </div>
        </aside>

        <section className="space-y-6 px-8 py-10">
          <header>
            <p className="text-sm text-neutral-500">プレビューの元となるコンテンツを選択してください。</p>
            <h1 className="text-3xl font-semibold">プレビュー生成</h1>
          </header>

          <div className="flex gap-8 text-sm font-semibold">
            {filterTabs.map((tab, index) => (
              <button
                key={tab}
                className={`pb-2 ${
                  index === 0 ? "border-b-2 border-black text-black" : "text-neutral-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-black/10 px-4 py-3">
              <span>🔍</span>
              <input
                type="text"
                placeholder="ライブラリを検索"
                className="flex-1 border-none bg-transparent text-sm focus:outline-none"
              />
            </div>
            {quickFilters.map((filter, index) => (
              <button
                key={filter}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                  index === 0 ? "border-black bg-black text-white" : "border-black/10 text-neutral-500"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sources.map((source) => (
              <ContentCard
                key={source.id}
                color={source.color}
                duration={source.duration}
                selected={source.selected}
              />
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-neutral-500">
              戻る
            </button>
            <button className="rounded-2xl border border-black bg-black px-5 py-3 text-sm font-semibold text-white">
              次へ
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
