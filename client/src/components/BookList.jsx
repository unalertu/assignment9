import { useState } from "react";

export default function BookList({ books, onEdit, onDelete, onToggleRead, onRate }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Delete this book?")) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (books.length === 0) {
    return <p style={{ color: "#888" }}>No books found.</p>;
  }

  return (
    <div>
      {books.map(book => (
        <div key={book.id} style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "10px",
          background: book.read ? "#f0f9f0" : "#fff"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <strong>{book.title}</strong> by {book.author}
              <br />
              <small>
                {book.year} &middot; {book.genre} &middot;{" "}
                {book.read ? "Read" : "Unread"}
                {book.rating && ` ⭐ ${book.rating}/5`}
              </small>
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button onClick={() => onToggleRead(book)}>
                {book.read ? "Mark Unread" : "Mark Read"}
              </button>
              <button onClick={() => onEdit(book)}>Edit</button>
              <button
                onClick={() => handleDelete(book.id)}
                disabled={deletingId === book.id}
                style={{ color: "red" }}
              >
                {deletingId === book.id ? "..." : "Delete"}
              </button>
            </div>
          </div>

          {book.read && (
            <div style={{ marginTop: "6px" }}>
              <label>Rate: </label>
              <select
                value={book.rating || ""}
                onChange={e => onRate(book.id, e.target.value === "" ? null : Number(e.target.value))}
              >
                <option value="">No rating</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
