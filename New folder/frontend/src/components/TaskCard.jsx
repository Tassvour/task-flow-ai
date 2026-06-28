import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

// Maps status to the next status (cycle)
const nextStatus = {
  "todo": "in-progress",
  "in-progress": "done",
  "done": "todo",
};

const statusLabel = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done",
};

const statusColors = {
  "todo": "bg-gray-700 text-gray-300",
  "in-progress": "bg-yellow-700/50 text-yellow-300",
  "done": "bg-green-700/50 text-green-300",
};

const priorityColors = {
  low: "text-green-400 bg-green-900/30",
  medium: "text-yellow-400 bg-yellow-900/30",
  high: "text-red-400 bg-red-900/30",
};

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async () => {
    const newStatus = nextStatus[task.status];
    setUpdating(true);
    try {
      const res = await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
      onStatusChange(res.data);
      toast.success(`Moved to ${statusLabel[newStatus]}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-gray-100 text-sm leading-snug flex-1">{task.title}</h4>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded bg-indigo-900/30"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-red-900/30"
          >
            Del
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {task.estimatedEffort && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
            ⏱ {task.estimatedEffort}
          </span>
        )}

        {task.dueDate && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${isOverdue ? "bg-red-900/40 text-red-400" : "bg-gray-700 text-gray-300"}`}>
            📅 {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue && " (overdue)"}
          </span>
        )}
      </div>

      {/* Status button */}
      <button
        onClick={handleStatusChange}
        disabled={updating}
        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity ${statusColors[task.status]} ${updating ? "opacity-50" : "hover:opacity-80"}`}
      >
        {updating ? "Updating..." : `${statusLabel[task.status]} →`}
      </button>
    </div>
  );
}

export default TaskCard;
