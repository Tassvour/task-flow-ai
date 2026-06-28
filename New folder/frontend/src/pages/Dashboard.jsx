import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Navbar from "../components/Navbar";
import BoardCard from "../components/BoardCard";
import ConfirmDialog from "../components/ConfirmDialog";
import Spinner from "../components/Spinner";

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null); // null = create mode
  const [form, setForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await api.get("/boards");
      setBoards(res.data);
    } catch {
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingBoard(null);
    setForm({ title: "", description: "" });
    setShowModal(true);
  };

  const openEditModal = (board) => {
    setEditingBoard(board);
    setForm({ title: board.title, description: board.description || "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBoard(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      if (editingBoard) {
        const res = await api.put(`/boards/${editingBoard._id}`, form);
        setBoards(boards.map((b) => (b._id === editingBoard._id ? res.data : b)));
        toast.success("Board updated");
      } else {
        const res = await api.post("/boards", form);
        setBoards([res.data, ...boards]);
        toast.success("Board created");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save board");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (board) => setDeleteTarget(board);

  const handleDelete = async () => {
    try {
      await api.delete(`/boards/${deleteTarget._id}`);
      setBoards(boards.filter((b) => b._id !== deleteTarget._id));
      toast.success("Board deleted");
    } catch {
      toast.error("Failed to delete board");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">My Boards</h2>
            <p className="text-sm text-gray-400 mt-0.5">Organize your work into boards</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New Board
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <Spinner />
        ) : boards.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-300">No boards yet</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first board to start tracking tasks</p>
            <button
              onClick={openCreateModal}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Create a Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <BoardCard
                key={board._id}
                board={board}
                onEdit={openEditModal}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              {editingBoard ? "Edit Board" : "New Board"}
            </h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Sprint 1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end mt-1">
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
                  {saving ? "Saving..." : editingBoard ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.title}"? All tasks in this board will also be deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
