const GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];
const currentYear = new Date().getFullYear();

export function validateBook(data, isPartial = false) {
  const errors = [];

  if (isPartial && Object.keys(data).length === 0) {
    return ["Request body cannot be empty"];
  }

  if ("title" in data || !isPartial) {
    if (typeof data.title !== "string" || data.title.trim().length === 0) {
      errors.push("title is required and must be a non-empty string");
    } else if (data.title.trim().length > 100) {
      errors.push("title must be at most 100 characters");
    }
  }

  if ("author" in data || !isPartial) {
    if (typeof data.author !== "string" || data.author.trim().length === 0) {
      errors.push("author is required and must be a non-empty string");
    } else if (data.author.trim().length > 100) {
      errors.push("author must be at most 100 characters");
    }
  }

  if ("year" in data || !isPartial) {
    if (!Number.isInteger(data.year) || data.year < 1000 || data.year > currentYear) {
      errors.push(`year must be an integer between 1000 and ${currentYear}`);
    }
  }

  if ("genre" in data || !isPartial) {
    if (!GENRES.includes(data.genre)) {
      errors.push(`genre must be one of: ${GENRES.join(", ")}`);
    }
  }

  if ("read" in data) {
    if (typeof data.read !== "boolean") {
      errors.push("read must be a boolean");
    }
  }

  if ("rating" in data) {
    if (data.rating !== null && (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5)) {
      errors.push("rating must be an integer from 1 to 5 or null");
    }
  }

  return errors;
}

export function validateMergedBook(book) {
  if (book.rating !== null && !book.read) {
    return ["rating is only allowed when read is true"];
  }
  return [];
}

export function isValidId(val) {
  const num = Number(val);
  return Number.isInteger(num) && num > 0;
}

export { GENRES };
