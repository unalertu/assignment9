import express from "express";
import cors from "cors";
import * as store from "./booksStore.js";
import { validateBook, validateMergedBook, validateQueryParams, isValidId } from "./validate.js";

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// catch malformed json
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  next(err);
});

// list books with query options
app.get("/api/books", async (req, res) => {
  const qErrors = validateQueryParams(req.query);
  if (qErrors.length > 0) {
    return res.status(400).json({ error: qErrors.join("; ") });
  }

  let books = await store.getAll();

  if (req.query.genre) {
    books = books.filter(b => b.genre === req.query.genre);
  }

  if (req.query.read !== undefined) {
    const readVal = req.query.read === "true";
    books = books.filter(b => b.read === readVal);
  }

  if (req.query.q) {
    const q = req.query.q.toLowerCase();
    books = books.filter(b =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }

  const sortField = req.query.sort || "id";
  const order = req.query.order === "desc" ? -1 : 1;

  books = [...books].sort((a, b) => {
    if (sortField === "rating") {
      if (a.rating === null && b.rating === null) return 0;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
      return (a.rating - b.rating) * order;
    }
    if (typeof a[sortField] === "string") {
      return a[sortField].localeCompare(b[sortField]) * order;
    }
    return (a[sortField] - b[sortField]) * order;
  });

  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const page = req.query.page ? Number(req.query.page) : 1;
  const start = (page - 1) * limit;
  const paged = books.slice(start, start + limit);

  res.json(paged);
});

// stats
app.get("/api/stats", async (req, res) => {
  const stats = await store.getStats();
  res.json(stats);
});

// get single book
app.get("/api/books/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  const book = await store.getById(Number(req.params.id));
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }
  res.json(book);
});

// create a book
app.post("/api/books", async (req, res) => {
  const { title, author, year, genre, read = false, rating = null } = req.body;
  const bookData = {
    title: title?.trim?.(),
    author: author?.trim?.(),
    year, genre, read, rating
  };

  const errors = validateBook(bookData);
  const mergeErrors = validateMergedBook(bookData);
  const allErrors = [...errors, ...mergeErrors];

  if (allErrors.length > 0) {
    return res.status(400).json({ error: allErrors.join("; ") });
  }

  if (await store.isDuplicate(bookData.title, bookData.author)) {
    return res.status(409).json({ error: "A book with this title and author already exists" });
  }

  const created = await store.create(bookData);
  res.status(201).location(`/api/books/${created.id}`).json(created);
});

// replace a book
app.put("/api/books/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  const id = Number(req.params.id);
  const existing = await store.getById(id);
  if (!existing) {
    return res.status(404).json({ error: "Book not found" });
  }

  const { title, author, year, genre, read = false, rating = null } = req.body;
  const bookData = {
    title: title?.trim?.(),
    author: author?.trim?.(),
    year, genre, read, rating
  };

  const errors = validateBook(bookData);
  const mergeErrors = validateMergedBook(bookData);
  const allErrors = [...errors, ...mergeErrors];

  if (allErrors.length > 0) {
    return res.status(400).json({ error: allErrors.join("; ") });
  }

  if (await store.isDuplicate(bookData.title, bookData.author, id)) {
    return res.status(409).json({ error: "A book with this title and author already exists" });
  }

  await store.update(id, bookData);
  const updated = await store.getById(id);
  res.json(updated);
});

// partial update
app.patch("/api/books/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  const id = Number(req.params.id);
  const existing = await store.getById(id);
  if (!existing) {
    return res.status(404).json({ error: "Book not found" });
  }

  const allowed = ["title", "author", "year", "genre", "read", "rating"];
  const changes = {};
  for (const key of allowed) {
    if (key in req.body) {
      changes[key] = key === "title" || key === "author"
        ? req.body[key]?.trim?.() ?? req.body[key]
        : req.body[key];
    }
  }

  const errors = validateBook(changes, true);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join("; ") });
  }

  const merged = { ...existing, ...changes };
  const mergeErrors = validateMergedBook(merged);
  if (mergeErrors.length > 0) {
    return res.status(400).json({ error: mergeErrors.join("; ") });
  }

  if (merged.title && merged.author && await store.isDuplicate(merged.title, merged.author, id)) {
    return res.status(409).json({ error: "A book with this title and author already exists" });
  }

  const updated = await store.patch(id, changes);
  res.json(updated);
});

// delete a book
app.delete("/api/books/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  const id = Number(req.params.id);
  const removed = await store.remove(id);
  if (!removed) {
    return res.status(404).json({ error: "Book not found" });
  }
  res.status(204).end();
});

// crash route for testing error handler
app.get("/api/crash", async (req, res) => {
  throw new Error("Intentional crash for testing");
});

// 404 for unmatched /api routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
