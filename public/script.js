// Bookstore frontend JavaScript. This file is shared by all pages in /public.

async function api(url, options = {}) {
    let response;
    try {
        response = await fetch(url, options);
    } catch (error) {
        throw new Error("Cannot connect to the server. Start it with: node app.js");
    }

    const text = await response.text();
    let data = text;
    try { data = text ? JSON.parse(text) : {}; } catch { /* Keep plain-text response */ }

    if (!response.ok) {
        const message = data && typeof data === "object" ? data.error || data.message : data;
        throw new Error(message || `Request failed (${response.status})`);
    }
    return data;
}

function showMessage(message, elementId = "message") {
    const element = document.getElementById(elementId);
    if (element) {
        element.hidden = false;
        element.textContent = message;
    }
}

function addBookRow(tbody, book) {
    if (!tbody || !book) return;
    const row = document.createElement("tr");
    [book.book_id, book.title, book.author, book.category,
        "₹" + Number(book.price).toFixed(2), book.stock].forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value ?? "";
        row.appendChild(cell);
    });
    tbody.appendChild(row);
}

async function loadBooks() {
    const rows = document.getElementById("rows");
    if (!rows) return;
    rows.innerHTML = "";
    try {
        const books = await api("/books");
        books.forEach(book => addBookRow(rows, book));
        showMessage(books.length ? `${books.length} book record(s) found.` : "No books found. Add your first book.");
    } catch (error) {
        showMessage("Could not load books: " + error.message);
    }
}

async function loadBookOptions() {
    const select = document.getElementById("bookSelect");
    if (!select) return;
    select.innerHTML = '<option value="">Loading books…</option>';
    try {
        const books = await api("/books");
        select.innerHTML = '<option value="">Select a book</option>';
        books.forEach(book => {
            const option = document.createElement("option");
            option.value = book.book_id;
            option.textContent = `${book.book_id} — ${book.title}`;
            select.appendChild(option);
        });
        if (!books.length) select.innerHTML = '<option value="">No books available</option>';
    } catch (error) {
        select.innerHTML = '<option value="">Unable to load books</option>';
        showMessage("Could not load books: " + error.message);
    }
}

async function getSelectedBook(id) {
    if (!id) throw new Error("Please select a book ID.");
    // GET /books/:id returns ONE book object, not an array.
    return await api("/books/" + encodeURIComponent(id));
}

async function showSelectedBook() {
    const id = document.getElementById("bookSelect")?.value;
    const rows = document.getElementById("rows");
    if (rows) rows.innerHTML = "";
    try {
        const book = await getSelectedBook(id);
        addBookRow(rows, book);
        showMessage("Book details loaded.");
    } catch (error) {
        showMessage(error.message);
    }
}

async function fillUpdateForm() {
    const id = document.getElementById("bookSelect")?.value;
    if (!id) {
        document.getElementById("bookForm")?.reset();
        const idInput = document.getElementById("book_id");
        if (idInput) idInput.value = "";
        showMessage("Select a book to edit.");
        return;
    }
    try {
        const book = await getSelectedBook(id);
        ["book_id", "title", "author", "category", "price", "stock"].forEach(key => {
            const input = document.getElementById(key);
            if (input) input.value = book[key] ?? "";
        });
        showMessage("Current details loaded. Make your changes and click Update Book.");
    } catch (error) {
        showMessage("Could not load book: " + error.message);
    }
}

async function previewDeleteBook() {
    const id = document.getElementById("bookSelect")?.value;
    const rows = document.getElementById("rows");
    if (rows) rows.innerHTML = "";
    if (!id) {
        showMessage("Select a book to preview its details.");
        return;
    }
    try {
        const book = await getSelectedBook(id);
        addBookRow(rows, book);
        showMessage("Please verify these details before deleting.");
    } catch (error) {
        showMessage(error.message);
    }
}

function formValues(keys) {
    const values = {};
    keys.forEach(key => {
        const input = document.getElementById(key);
        values[key] = input ? input.value.trim() : "";
    });
    return values;
}

function displayResult(result, fallback) {
    return result && typeof result === "object" ? (result.message || fallback) : (result || fallback);
}

document.addEventListener("DOMContentLoaded", () => {
    const page = location.pathname.split("/").pop() || "index.html";

    if (page === "list.html") {
        loadBooks();
        document.getElementById("refreshBooks")?.addEventListener("click", loadBooks);
    }

    if (page === "insert.html") {
        document.getElementById("bookForm")?.addEventListener("submit", async event => {
            event.preventDefault();
            const body = formValues(["book_id", "title", "author", "category", "price", "stock"]);
            try {
                const result = await api("/books", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
                alert(displayResult(result, "Book added successfully."));
                location.href = "list.html";
            } catch (error) {
                showMessage("Could not add book: " + error.message);
            }
        });
    }

    if (page === "listOne.html") {
        loadBookOptions();
        document.getElementById("showBook")?.addEventListener("click", showSelectedBook);
        document.getElementById("refreshOptions")?.addEventListener("click", loadBookOptions);
        document.getElementById("bookSelect")?.addEventListener("change", () => {
            const rows = document.getElementById("rows");
            if (rows) rows.innerHTML = "";
            showMessage("Click Show details to view the selected book.");
        });
    }

    if (page === "update.html") {
        loadBookOptions();
        document.getElementById("bookSelect")?.addEventListener("change", fillUpdateForm);
        document.getElementById("bookForm")?.addEventListener("submit", async event => {
            event.preventDefault();
            const id = document.getElementById("book_id")?.value;
            if (!id) {
                showMessage("Please select a book first.");
                return;
            }
            const body = formValues(["title", "author", "category", "price", "stock"]);
            try {
                const result = await api("/books/" + encodeURIComponent(id), {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
                alert(displayResult(result, "Book updated successfully."));
                location.href = "list.html";
            } catch (error) {
                showMessage("Could not update book: " + error.message);
            }
        });
    }

    if (page === "delete.html") {
        loadBookOptions();
        document.getElementById("bookSelect")?.addEventListener("change", previewDeleteBook);
        document.getElementById("deleteBook")?.addEventListener("click", async () => {
            const select = document.getElementById("bookSelect");
            const id = select?.value;
            if (!id) {
                showMessage("Please select a book.");
                return;
            }
            const title = select.selectedOptions[0]?.textContent || `book ${id}`;
            if (!confirm(`Delete ${title}. Are You Sure?.`)) return;
            try {
                const result = await api("/books/" + encodeURIComponent(id), { method: "DELETE" });
                alert(displayResult(result, "Book deleted successfully."));
                location.reload();
            } catch (error) {
                showMessage("Could not delete book: " + error.message);
            }
        });
    }
});
