# Assignment 9 - Reading List App

A full-stack reading list application with an Express REST API backend and a React frontend.

## How to Run

### Server

```bash
cd server
npm install
npm run dev
```

The server runs on `http://localhost:3000` by default. You can change the port with the `PORT` environment variable.

Set `CLIENT_ORIGIN` to your client's URL (defaults to `http://localhost:5173`).

### Client

```bash
cd client
npm install
```

Create a `.env` file based on `.env.example`:

```
VITE_API_URL=http://localhost:3000
```

Then start the dev server:

```bash
npm run dev
```

The client runs on `http://localhost:5173`.

## File Organization

```
/assignment9
 ├─ server/
 │   ├─ server.js          # Express app, routes, middleware
 │   ├─ booksStore.js       # In-memory data store with async functions
 │   ├─ validate.js         # Validation helpers
 │   ├─ package.json
 │   └─ package-lock.json
 ├─ client/
 │   ├─ src/
 │   │   ├─ api/books.js    # All fetch calls, shared helper
 │   │   ├─ components/
 │   │   │   ├─ BookForm.jsx
 │   │   │   ├─ BookList.jsx
 │   │   │   ├─ SearchFilter.jsx
 │   │   │   └─ StatsPanel.jsx
 │   │   ├─ App.jsx
 │   │   └─ main.jsx
 │   ├─ .env.example
 │   ├─ index.html
 │   ├─ vite.config.js
 │   └─ package.json
 ├─ .gitignore
 └─ README.md
```

## Curl Evidence

### 1. 200 - List with two query params (genre + sort)

```
$ curl --include "http://localhost:3000/api/books?genre=fantasy&sort=year"
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 319
Date: Sat, 22 Nov 2026 18:30:12 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":5,"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy","read":true,"rating":3},{"id":3,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"fantasy","read":true,"rating":5}]
```

### 2. 200 - Single book

```
$ curl --include http://localhost:3000/api/books/1
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 102
Date: Sat, 22 Nov 2026 18:30:45 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"1984","author":"George Orwell","year":1949,"genre":"fiction","read":true,"rating":5}
```

### 3. 201 - Create a book (Location header visible)

```
$ curl --include -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title":"The Martian","author":"Andy Weir","year":2011,"genre":"science"}'
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/7
Content-Type: application/json; charset=utf-8
Content-Length: 112
Date: Sat, 22 Nov 2026 18:31:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":7,"title":"The Martian","author":"Andy Weir","year":2011,"genre":"science","read":false,"rating":null}
```

### 4. 400 - Invalid body

```
$ curl --include -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title":"","year":"abc"}'
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 148
Date: Sat, 22 Nov 2026 18:31:55 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"title is required and must be a non-empty string; author is required and must be a non-empty string; year must be an integer between 1000 and 2026"}
```

### 5. 400 - Repeated query parameter

```
$ curl --include "http://localhost:3000/api/books?genre=fiction&genre=history"
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 48
Date: Sat, 22 Nov 2026 18:32:18 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"parameter 'genre' must not be repeated"}
```

### 6. 404 - Missing book

```
$ curl --include http://localhost:3000/api/books/999
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 25
Date: Sat, 22 Nov 2026 18:32:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}
```

### 7. 409 - Duplicate book

```
$ curl --include -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title":"1984","author":"George Orwell","year":1949,"genre":"fiction"}'
HTTP/1.1 409 Conflict
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 60
Date: Sat, 22 Nov 2026 18:33:05 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"A book with this title and author already exists"}
```

### 8. PUT - Replace book 2

```
$ curl --include -X PUT http://localhost:3000/api/books/2 -H "Content-Type: application/json" -d '{"title":"Sapiens","author":"Yuval Noah Harari","year":2015,"genre":"history","read":true,"rating":5}'
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 103
Date: Sat, 22 Nov 2026 18:33:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":2,"title":"Sapiens","author":"Yuval Noah Harari","year":2015,"genre":"history","read":true,"rating":5}
```

### 9. PATCH - Partially update same book 2

```
$ curl --include -X PATCH http://localhost:3000/api/books/2 -H "Content-Type: application/json" -d '{"rating":3}'
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 103
Date: Sat, 22 Nov 2026 18:34:02 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":2,"title":"Sapiens","author":"Yuval Noah Harari","year":2015,"genre":"history","read":true,"rating":3}
```

PUT replaces the whole book so I had to send all fields again. PATCH only sent `rating` and the rest stayed the same. That's the main difference.

### 10. 204 - Delete book 6, then 404 on same delete

```
$ curl --include -X DELETE http://localhost:3000/api/books/6
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Date: Sat, 22 Nov 2026 18:34:30 GMT
Connection: keep-alive
Keep-Alive: timeout=5

$ curl --include -X DELETE http://localhost:3000/api/books/6
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 25
Date: Sat, 22 Nov 2026 18:34:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}
```

### 11. Stats before and after a change

**Before deleting book 6:**

```
$ curl --include http://localhost:3000/api/stats
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 128
Date: Sat, 22 Nov 2026 18:35:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":6,"read":4,"unread":2,"averageRating":4.3,"byGenre":{"fiction":1,"non-fiction":1,"fantasy":2,"science":1,"history":1}}
```

**After deleting book 6:**

```
$ curl --include http://localhost:3000/api/stats
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 112
Date: Sat, 22 Nov 2026 18:35:25 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":5,"read":4,"unread":1,"averageRating":4.3,"byGenre":{"fiction":1,"non-fiction":1,"fantasy":2,"science":1}}
```

The history genre disappeared because that was the only book with that genre.

## Preflight Evidence

When I opened the React app and it made a request to the server, I checked the browser Network tab. Before the actual GET request, the browser sent an **OPTIONS** request (preflight) to `http://localhost:3000/api/books`. The response headers included:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
```

This happened because the client is on `localhost:5173` and the server is on `localhost:3000`, so it's a cross-origin request. The browser checks with OPTIONS first to see if the server allows it. The `cors` package handles this automatically and sends back the right headers.

## Reasoning Questions

### 1. Parameters

The book's `id` identifies a specific resource so it goes in the URL path (`/api/books/3`). That way each book has its own unique URL. `genre` and `sort` are optional filters/modifiers for the list, so they go in the query string. If `id` were in the query string like `/api/books?id=3`, it would be weird because the URL would look like you're filtering the list rather than accessing one specific book. Also REST convention says the resource identifier belongs in the path.

### 2. Body parsing

I moved `express.json()` below the routes and tried sending a POST request with a JSON body. `req.body` was `undefined` because the middleware that parses JSON hadn't run yet when the route handler executed. The POST returned 400 because my validation saw `undefined` values for all required fields. When I moved it back above the routes it worked again.

### 3. One response

I removed the `return` before a `res.status(404).json(...)` in the GET `/api/books/:id` handler. When I requested a non-existent book, the server sent the 404 response but then continued executing and tried to send another response with `res.json(book)`. This caused the error "Cannot set headers after they are sent to the client" and the server crashed. The `return` is needed to stop the function from continuing after sending a response.

### 4. PUT and PATCH

If I want to change just the rating of a book, PATCH is better because I only send `{ "rating": 4 }` and the rest stays the same. With PUT I'd have to send every single field again even though only the rating changed. But if a user is on an edit form and changes multiple fields at once, PUT makes more sense because we're replacing the whole thing with the new version from the form. In my app, the edit form uses PUT (sends everything) and the toggle read / set rating buttons use PATCH (send only what changed).

### 5. CORS

I set `CLIENT_ORIGIN` to `http://localhost:9999` (a wrong value) and tried using the app from `http://localhost:5173`. The browser console showed: "Access to fetch at 'http://localhost:3000/api/books' from origin 'http://localhost:5173' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 'http://localhost:9999' that is not equal to the supplied origin." The server still logged the request because CORS is enforced by the browser, not the server. `curl` still worked fine because curl doesn't do CORS checks, it's not a browser.

### 6. Validation

Even though the client checks the form before submitting, the server must validate again because anyone can send requests directly to the API (like with curl or Postman) without going through the client. The client-side validation is for a good user experience (quick feedback), but the server validation is for actual security and data integrity. You can never trust what comes from the client.

### 7. State

After restarting the server, all the books I added or changes I made were gone and it went back to the original 6 seed books. This is because the data lives in the server's memory (a JavaScript array). When the process stops, that memory is cleared. To keep the data permanently, we would need a database that stores the data on disk, so it survives server restarts.

## Self-Study Notes

### URLSearchParams

I used `URLSearchParams` in the client's API module to build query strings safely. Instead of manually concatenating `?genre=fiction&sort=year`, I create a `new URLSearchParams()` object and call `append(key, value)` for each parameter. Then `toString()` gives me the properly encoded query string. This handles special characters automatically (like spaces becoming `%20`). I found this on MDN.

### localeCompare

For sorting books by title or author, I used `String.localeCompare()` which compares strings alphabetically according to locale rules. Without it, sorting would use Unicode code point order which doesn't work well for accented characters or case-insensitive comparison. I used it like `a.title.localeCompare(b.title)` in the sort callback.

### import.meta.env in Vite

Vite exposes environment variables through `import.meta.env`. Variable names must start with `VITE_` to be exposed to the client code (for security, so server-only secrets don't leak). I used `import.meta.env.VITE_API_URL` to get the API base URL. The `.env.example` file documents what variables are needed.

### 204 No Content in Express 5

For DELETE, I return a 204 status with no body. In Express 5, I used `res.status(204).end()` which sends the status code and ends the response without any body. Using `.json()` or `.send()` with 204 would add an unnecessary body.

### AbortController

I used `AbortController` to cancel stale fetch requests. In the `useEffect` that fetches books, I create a controller and pass `controller.signal` to the fetch call. In the cleanup function, I call `controller.abort()`. This way, when filters change quickly, old requests get cancelled so they don't overwrite newer results. I catch the `AbortError` and just ignore it since it's expected.

## Challenges

- Figuring out Express 5 error handling was tricky. The malformed JSON error had a `type` property of `"entity.parse.failed"` which I had to figure out by testing.
- Getting PATCH validation right was hard because I had to validate only the sent fields but then check the merged result too (like making sure rating is null when read is false).
- The AbortController cleanup in useEffect took me a while to get right. At first I was getting state updates on unmounted components.
- Understanding the difference between how the browser handles CORS vs how curl ignores it.

## Crash Route

There is a `GET /api/crash` route that deliberately throws an error to test the error handling middleware. It returns 500 with `{"error":"Something went wrong"}`.
