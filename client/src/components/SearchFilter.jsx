const GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];
const SORT_OPTIONS = [
  { value: "", label: "Default (ID)" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "year", label: "Year" },
  { value: "rating", label: "Rating" }
];

export default function SearchFilter({ filters, onChange }) {
  const update = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "12px",
      padding: "12px", background: "#f5f5f5", borderRadius: "8px", marginBottom: "16px"
    }}>
      <div>
        <label>Search: </label>
        <input
          type="text"
          placeholder="Title or author..."
          value={filters.q || ""}
          onChange={e => update("q", e.target.value)}
        />
      </div>

      <div>
        <label>Genre: </label>
        <select value={filters.genre || ""} onChange={e => update("genre", e.target.value)}>
          <option value="">All genres</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div>
        <label>Status: </label>
        <select value={filters.read ?? ""} onChange={e => update("read", e.target.value)}>
          <option value="">All</option>
          <option value="true">Read</option>
          <option value="false">Unread</option>
        </select>
      </div>

      <div>
        <label>Sort by: </label>
        <select value={filters.sort || ""} onChange={e => update("sort", e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label>Order: </label>
        <select value={filters.order || "asc"} onChange={e => update("order", e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
}
