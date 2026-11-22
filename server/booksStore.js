const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

let nextId = 7;

let books = [
  { id: 1, title: "1984", author: "George Orwell", year: 1949, genre: "fiction", read: true, rating: 5 },
  { id: 2, title: "Sapiens", author: "Yuval Noah Harari", year: 2011, genre: "non-fiction", read: true, rating: 4 },
  { id: 3, title: "Dune", author: "Frank Herbert", year: 1965, genre: "fantasy", read: true, rating: 5 },
  { id: 4, title: "A Brief History of Time", author: "Stephen Hawking", year: 1988, genre: "science", read: false, rating: null },
  { id: 5, title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937, genre: "fantasy", read: true, rating: 3 },
  { id: 6, title: "Guns Germs and Steel", author: "Jared Diamond", year: 1997, genre: "history", read: false, rating: null }
];

export async function getAll() {
  await delay();
  return books.map(b => ({ ...b }));
}

export async function getById(id) {
  await delay();
  const book = books.find(b => b.id === id);
  return book ? { ...book } : null;
}

export async function create(data) {
  await delay();
  const newBook = { id: nextId++, ...data };
  books = [...books, newBook];
  return { ...newBook };
}

export async function update(id, data) {
  await delay();
  let found = false;
  books = books.map(b => {
    if (b.id === id) {
      found = true;
      return { ...data, id };
    }
    return b;
  });
  return found;
}

export async function patch(id, changes) {
  await delay();
  const book = books.find(b => b.id === id);
  if (!book) return null;
  const updated = { ...book, ...changes, id };
  books = books.map(b => b.id === id ? updated : b);
  return { ...updated };
}

export async function remove(id) {
  await delay();
  const exists = books.some(b => b.id === id);
  if (exists) {
    books = books.filter(b => b.id !== id);
  }
  return exists;
}

export async function isDuplicate(title, author, excludeId = null) {
  await delay();
  const t = title.trim().toLowerCase();
  const a = author.trim().toLowerCase();
  return books.some(b =>
    b.title.toLowerCase() === t &&
    b.author.toLowerCase() === a &&
    b.id !== excludeId
  );
}
