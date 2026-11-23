import { useState, useEffect, useCallback } from "react";
import * as api from "./api/books.js";
import BookForm from "./components/BookForm.jsx";
import BookList from "./components/BookList.jsx";
import SearchFilter from "./components/SearchFilter.jsx";
import StatsPanel from "./components/StatsPanel.jsx";

export default function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const fetchBooks = useCallback((currentFilters, signal) => {
    setLoading(true);
    setError(null);

    const params = {};
    if (currentFilters.q) params.q = currentFilters.q;
    if (currentFilters.genre) params.genre = currentFilters.genre;
    if (currentFilters.read) params.read = currentFilters.read;
    if (currentFilters.sort) params.sort = currentFilters.sort;
    if (currentFilters.order && currentFilters.order !== "asc") params.order = currentFilters.order;

    api.getBooks(params, signal)
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const fetchStats = useCallback(() => {
    api.getStats()
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchBooks(filters, controller.signal);
    return () => controller.abort();
  }, [filters, fetchBooks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = () => {
    fetchBooks(filters);
    fetchStats();
  };

  const handleAdd = async (bookData) => {
    await api.createBook(bookData);
    setShowForm(false);
    refresh();
  };

  const handleEdit = async (bookData) => {
    await api.updateBook(editingBook.id, bookData);
    setEditingBook(null);
    refresh();
  };

  const handleDelete = async (id) => {
    await api.deleteBook(id);
    refresh();
  };

  const handleToggleRead = async (book) => {
    const changes = { read: !book.read };
    if (!changes.read) {
      changes.rating = null;
    }
    await api.patchBook(book.id, changes);
    refresh();
  };

  const handleRate = async (id, rating) => {
    await api.patchBook(id, { rating });
    refresh();
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Reading List</h1>

      <StatsPanel stats={stats} />

      <div style={{ marginBottom: "16px" }}>
        {!showForm && !editingBook && (
          <button onClick={() => setShowForm(true)} style={{ padding: "8px 16px", fontSize: "1em" }}>
            + Add Book
          </button>
        )}
      </div>

      {showForm && (
        <BookForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingBook && (
        <BookForm
          bookToEdit={editingBook}
          onSubmit={handleEdit}
          onCancel={() => setEditingBook(null)}
        />
      )}

      <SearchFilter filters={filters} onChange={setFilters} />

      {loading && <p>Loading books...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && (
        <BookList
          books={books}
          onEdit={book => { setEditingBook(book); setShowForm(false); }}
          onDelete={handleDelete}
          onToggleRead={handleToggleRead}
          onRate={handleRate}
        />
      )}
    </div>
  );
}
