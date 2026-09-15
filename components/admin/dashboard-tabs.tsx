type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const tabs = [
  "courses",
  "blogs",
  "notices",
  "students",
  "contact",
  "gallery",
  "library",
];

export default function DashboardTabs({
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <div className="flex gap-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-lg border capitalize ${
            activeTab === tab
              ? "bg-blue-600 text-white"
              : "bg-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}