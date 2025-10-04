// src/app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-8">🌍 Atlas Eye</h1>
      <p className="mb-12 text-lg text-gray-300">
        Scegli una lente per osservare il mondo
      </p>
      <div className="grid grid-cols-2 gap-6">
        <button className="px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg">
          InfoLens
        </button>
        <button className="px-6 py-4 bg-red-600 hover:bg-red-700 rounded-xl shadow-lg">
          WarLens
        </button>
        <button className="px-6 py-4 bg-green-600 hover:bg-green-700 rounded-xl shadow-lg">
          EconomyLens
        </button>
        <button className="px-6 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg">
          CivicLens
        </button>
      </div>
    </main>
  );
}
