export default function EntryCard({ entry, onEdit, onDelete }) {
  return (
    <div className="border p-4 rounded mb-2">
      <h2 className="text-xl font-semibold">{entry.title}</h2>
      <p>{entry.content}</p>
      <div className="mt-2 space-x-2">
        <button onClick={onEdit} className="text-blue-600 underline">Edit</button>
        <button onClick={onDelete} className="text-red-600 underline">Delete</button>
      </div>
    </div>
  )
}
