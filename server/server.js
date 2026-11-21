import express from "express";
import cors from "cors";
import * as store from "./booksStore.js";
import { isValidId } from "./validate.js";

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
