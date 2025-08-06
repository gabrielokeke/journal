export default function EntryCard({ entry, onEdit, onDelete }) {
  const moodEmojis = {
    1: "😢",
    2: "😞",
    3: "😐",
    4: "😊",
    5: "🎉",
  }

  const categoryColors = {
    Work: "bg-blue-100 text-blue-800",
    Personal: "bg-green-100 text-green-800",
    Health: "bg-red-100 text-red-800",
    Learning: "bg-purple-100 text-purple-800",
    Creative: "bg-pink-100 text-pink-800",
    Social: "bg-yellow-100 text-yellow-800",
    Other: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mb-4 hover:shadow-lg transition">
      <h2 className="text-2xl font-semibold text-gray-900">{entry.title}</h2>
      <p className="mt-2 text-gray-700">{entry.content}</p>

      <div className="flex items-center mt-4 space-x-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            categoryColors[entry.category] || categoryColors.Other
          }`}
        >
          {entry.category}
        </span>

        <span className="flex items-center gap-1 text-sm text-gray-700">
          Mood: <span className="text-lg">{moodEmojis[entry.mood] || "😐"}</span>
        </span>
      </div>

      <div className="mt-4 space-x-3">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 font-semibold"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
