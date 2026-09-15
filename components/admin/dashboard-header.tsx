export default function DashboardHeader() {
  return (
    <div className="border-b bg-white">
      <div className="container mx-auto py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Admin Dashboard
          </h1>

          <p className="text-sm text-muted-foreground">
            Vihaan Education Academy
          </p>
        </div>

        <button className="border px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>
    </div>
  );
}