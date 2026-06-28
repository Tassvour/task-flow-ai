import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import ConfirmDialog from "../components/ConfirmDialog";
import Spinner from "../components/Spinner";

const defaultForm = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  estimatedEffort: "",
};

function BoardDetail() {
  const { id: boardId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  // AI suggestion state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [boardId]);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?boardId=${boardId}`);
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setForm(defaultForm);
    setAiSuggestion(null);
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setAiSuggestion(null);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      estimatedEffort: task.estimatedEffort || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setAiSuggestion(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      const payload = { ...form, boardId };
      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, payload);
        setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data : t)));
        toast.success("Task updated");
      } else {
        const res = await api.post("/tasks", payload);
        setTasks([res.data, ...tasks]);
        toast.success("Task created");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  // Call Gemini AI for an estimate suggestion
  const handleSuggestEstimate = async () => {
    if (!form.title.trim()) return toast.error("Enter a task title first");
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await api.post("/ai/suggest-estimate", {
        title: form.title,
        description: form.description,
        priority: form.priority,
      });
      setAiSuggestion(res.data);
    } catch {
      toast.error("AI suggestion failed");
    } finally {
      setAiLoading(false);
    }
  };

  // User accepts the AI suggestion — fill the form fields
  const acceptSuggestion = () => {
    setForm({
      ...form,
      estimatedEffort: aiSuggestion.estimatedEffort,
      dueDate: aiSuggestion.suggestedDueDate,
    });
    setAiSuggestion(null);
    toast.success("Suggestion applied!");
  };

  const handleStatusChange = (updatedTask) => {
    setTasks(tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
  };

  const confirmDelete = (task) => setDeleteTarget(task);

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${deleteTarget._id}`);
      setTasks(tasks.filter((t) => t._id !== deleteTarget._id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeleteTarget(null);
    }
  };

  // Group tasks by status for a kanban-style view
  const columns = [
    { key: "todo", label: "To Do" },
    { key: "in-progress", label: "In Progress" },
    { key: "done", label: "Done" },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Boards</Link>
          <span>›</span>
          <span className="text-gray-200">Board Tasks</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Tasks</h2>
          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Task
          </button>
        </div>

        {/* Kanban columns */}
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-300 text-sm">{col.label}</h3>
                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-gray-600 text-sm">No tasks</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {colTasks.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          onEdit={openEditModal}
                          onDelete={confirmDelete}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create / Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              {editingTask ? "Edit Task" : "New Task"}
            </h3>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="What needs to be done?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional details..."
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due Date & Estimated Effort side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Estimated Effort</label>
                  <input
                    type="text"
                    value={form.estimatedEffort}
                    onChange={(e) => setForm({ ...form, estimatedEffort: e.target.value })}
                    placeholder="e.g. 2 hours"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* AI Suggest Estimate button */}
              <div className="border border-indigo-800 bg-indigo-950/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-indigo-300 font-medium">✨ AI Estimate</span>
                  <button
                    type="button"
                    onClick={handleSuggestEstimate}
                    disabled={aiLoading}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    {aiLoading ? "Thinking..." : "Suggest Estimate"}
                  </button>
                </div>

                {/* AI suggestion result */}
                {aiSuggestion && (
                  <div className="mt-2 bg-gray-800 rounded-lg p-3 text-xs text-gray-300 flex flex-col gap-2">
                    {aiSuggestion.isFallback && (
                      <p className="text-yellow-400">⚠ AI unavailable — showing default estimate</p>
                    )}
                    <p><span className="text-gray-400">Effort:</span> {aiSuggestion.estimatedEffort}</p>
                    <p><span className="text-gray-400">Due Date:</span> {aiSuggestion.suggestedDueDate}</p>
                    <p><span className="text-gray-400">Reason:</span> {aiSuggestion.reasoning}</p>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={acceptSuggestion}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-1 rounded text-xs transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiSuggestion(null)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 rounded text-xs transition-colors"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Form actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                >
                  {saving ? "Saving..." : editingTask ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete task "${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default BoardDetail;
