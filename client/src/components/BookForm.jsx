import { useState } from "react";

const GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];

export default function BookForm({ bookToEdit, onSubmit, onCancel }) {
  const isEdit = !!bookToEdit;
  const [title, setTitle] = useState(bookToEdit?.title || "");
  const [author, setAuthor] = useState(bookToEdit?.author || "");
  const [year, setYear] = useState(bookToEdit?.year || "");
  const [genre, setGenre] = useState(bookToEdit?.genre || "fiction");
  const [read, setRead] = useState(bookToEdit?.read || false);
  const [rating, setRating] = useState(bookToEdit?.rating || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      year: Number(year),
      genre,
      read,
      rating: rating === "" ? null : Number(rating)
    };

    try {
      await onSubmit(bookData);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", marginBottom: "16px", background: "#fafafa" }}>
      <h3>{isEdit ? "Edit Book" : "Add New Book"}</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "8px" }}>
        <label>Title: </label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label>Author: </label>
        <input value={author} onChange={e => setAuthor(e.target.value)} required />
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label>Year: </label>
        <input type="number" value={year} onChange={e => setYear(e.target.value)} required />
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label>Genre: </label>
        <select value={genre} onChange={e => setGenre(e.target.value)}>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label>
          <input type="checkbox" checked={read} onChange={e => setRead(e.target.checked)} />
          {" "}Read
        </label>
      </div>

      {read && (
        <div style={{ marginBottom: "8px" }}>
          <label>Rating (1-5): </label>
          <select value={rating} onChange={e => setRating(e.target.value)}>
            <option value="">No rating</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : isEdit ? "Update" : "Add Book"}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} style={{ marginLeft: "8px" }}>
          Cancel
        </button>
      )}
    </form>
  );
}
