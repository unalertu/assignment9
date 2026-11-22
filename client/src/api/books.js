const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = { ...options };

  if (options.body) {
    config.headers = {
      "Content-Type": "application/json",
      ...config.headers
    };
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);

  if (res.status === 204) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export async function getBooks(params = {}, signal) {
  const query = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") {
      query.append(key, val);
    }
  }
  const qs = query.toString();
  const path = qs ? `/api/books?${qs}` : "/api/books";
  return request(path, { signal });
}

export async function getBook(id) {
  return request(`/api/books/${id}`);
}

export async function createBook(book) {
  return request("/api/books", {
    method: "POST",
    body: book
  });
}

export async function updateBook(id, book) {
  return request(`/api/books/${id}`, {
    method: "PUT",
    body: book
  });
}

export async function patchBook(id, changes) {
  return request(`/api/books/${id}`, {
    method: "PATCH",
    body: changes
  });
}

export async function deleteBook(id) {
  return request(`/api/books/${id}`, {
    method: "DELETE"
  });
}

export async function getStats() {
  return request("/api/stats");
}
