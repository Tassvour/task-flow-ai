import { useNavigate } from "react-router-dom";

function BoardCard({ board, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col gap-3 hover:border-indigo-500 transition-colors cursor-pointer"
      onClick={() => navigate(`/board/${board._id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-100 text-base leading-tight">{board.title}</h3>
        {/* Stop propagation so clicks on buttons don't navigate */}
        <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(board)}
            className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-900/30 hover:bg-indigo-900/50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(board)}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-900/30 hover:bg-red-900/50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {board.description && (
        <p className="text-sm text-gray-400 line-clamp-2">{board.description}</p>
      )}

      <p className="text-xs text-gray-500">
        {new Date(board.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default BoardCard;
