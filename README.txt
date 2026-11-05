BOOKSTORE CRUD PROJECT - SETUP & VS CODE INSTRUCTIONS
======================================================

PROJECT STRUCTURE:
------------------
bookstore2/
├── app.js               # Node.js Express backend & MySQL API endpoints
├── package.json         # NPM configuration & dependencies
├── README.txt           # Setup and execution guide
└── public/              # Static frontend client files
    ├── index.html       # Home dashboard
    ├── list.html        # View all books in responsive table
    ├── listOne.html     # Look up single book by ID
    ├── insert.html      # Add a new book to catalogue
    ├── update.html      # Update existing book details
    ├── delete.html      # Preview & delete book record
    ├── style.css        # Professional bookstore stylesheet
    ├── script.js        # Shared frontend CRUD JavaScript logic
    └── images/          # Local bookstore imagery
        ├── hero-bookstore.jpg
        ├── books-collection.jpg
        ├── search-book.jpg
        ├── add-book.jpg
        ├── update-book.jpg
        └── delete-book.jpg

QUICK START IN VISUAL STUDIO CODE:
----------------------------------
1. Open Visual Studio Code.
2. Select "File" -> "Open Folder..." and choose the extracted "bookstore2" directory.
3. Open the built-in terminal (Press Ctrl + ` or go to Terminal -> New Terminal).
4. Install dependencies by running:
     npm install
   (Alternatively: npm install express mysql2)

5. In MySQL Workbench or MySQL command line, verify or create the database:
     CREATE DATABASE IF NOT EXISTS bookstore;
     USE bookstore;
     CREATE TABLE IF NOT EXISTS books (
       book_id INT PRIMARY KEY,
       title VARCHAR(200) NOT NULL,
       author VARCHAR(150) NOT NULL,
       category VARCHAR(100) NOT NULL,
       price DECIMAL(10,2) NOT NULL,
       stock INT NOT NULL DEFAULT 0
     );

6. Open app.js and ensure your MySQL password is set in the db connection:
     password: "YOUR_MYSQL_PASSWORD"

7. Start the server in the VS Code terminal:
     node app.js
   (or: npm start)

8. Open your browser and navigate to:
     http://localhost:3000

All six pages (Home, List All, Find, Add, Update, Delete) are fully responsive, linked to style.css, feature locally stored high-definition bookstore imagery, and synchronize with your MySQL database in real time.
