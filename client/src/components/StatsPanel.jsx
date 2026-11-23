export default function StatsPanel({ stats }) {
  if (!stats) return null;

  return (
    <div style={{
      border: "1px solid #4a90d9",
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "16px",
      background: "#eef5ff"
    }}>
      <h3 style={{ margin: "0 0 8px 0" }}>Statistics</h3>
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <span><strong>Total:</strong> {stats.total}</span>
        <span><strong>Read:</strong> {stats.read}</span>
        <span><strong>Unread:</strong> {stats.unread}</span>
        <span>
          <strong>Avg Rating:</strong>{" "}
          {stats.averageRating !== null ? stats.averageRating.toFixed(1) : "N/A"}
        </span>
      </div>
      {stats.byGenre && Object.keys(stats.byGenre).length > 0 && (
        <div style={{ marginTop: "8px" }}>
          <strong>By Genre: </strong>
          {Object.entries(stats.byGenre).map(([genre, count]) => (
            <span key={genre} style={{
              background: "#d0e4f7",
              padding: "2px 8px",
              borderRadius: "4px",
              marginRight: "6px",
              fontSize: "0.9em"
            }}>
              {genre}: {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
