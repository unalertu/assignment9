import express from "express";
import cors from "cors";
import * as store from "./booksStore.js";
import { validateBook, validateMergedBook, isValidId } from "./validate.js";

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// get all books
app.get("/api/books", async (req, res) => {
  const books = await store.getAll();
  res.json(books);
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
