import express from "express";
import mysql from "mysql";
import { v4 as uuid } from "uuid";
import cors from "cors";
import bcrypt from "bcrypt";

import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "expense_tracker",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySql database: ", err);
  } else {
    console.log("Connected to MySql");
  }
});


const secretKey = "qwerty789654";

function verifyToken(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401).json({ error: "Unauthorized " });
    return;
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.userId = decoded.id;
    next();
  });
}

app.get("/api/getUsers", (req, res) => {
  db.query("SELECT * FROM register", (err, results) => {
    if (err) {
      console.error("Error Executing Mysql query", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

app.get('/user/:registerId', (req, res) => {
  const registerId = req.params.registerId;
  
  const query = 'SELECT * FROM register WHERE id = ?';

 
  db.query(query, [registerId], (error, results) => {
    if (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Server Error' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ message: 'User not found' });
      } else {
       
        res.status(200).json(results[0]);
      }
    }
  });
});





app.post("/register", async (req, res) => {
  let { name, phone, email, password } = req.body;

  
  const id = uuid();

 

  const hashedPassword = await bcrypt.hash(password, 10);


  const insertQuery =
    "INSERT INTO register (id, name, phone, email, password) VALUES (?, ?, ?, ?, ?)";
  db.query(insertQuery, [id, name, phone, email, hashedPassword], (err) => {
    if (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ error: "Error inserting data" });
    } else {
      res.status(200).json({ message: "Data inserted successfully", id });
    }
  });
});

//Login endpoint
app.post("/login", (req, res) => {
  const { name, password } = req.body;

  const query = "SELECT * FROM register WHERE name = ?";
  db.query(query, [name], (err, results) => {
    if (err) {
      console.error("Error querying the database :", err);
      res.status(500).json({ error: "Server error" });
      return;
    }

    if (results.length === 1) {
      const user = results[0];
      console.log(password);
      const id = user.id;
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        if (err) {
          console.error("Error comparing passwords", err);
          res.status(500).json({ error: "Server error" });
          return;
        }

        console.log("result", passwordMatch);

        if (passwordMatch) {
          // Create a JWT token and set it as a cookie
          const token = jwt.sign({ id: user.id }, secretKey, {
            expiresIn: "1h",
          });
          res.cookie("jwt", token, { httpOnly: true });
          res.status(200).json({ token,id,name, message: "Login successful" });
        } else {
          res.status(401).json({ error: "Invalid name or password" });
        }
      });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  });
});

//Dashboard endpoint(protected route)
app.get("/dashboard", verifyToken, (req, res) => {
  
  const userId = req.userId;

  const query = "SELECT * FROM register WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user data :", err);
      res.status(500).json({ error: "Server error" });
      return;
    }

    if (results.length === 1) {
      const user = results[0];
      res.status(200).json({ message: "Welcome to your dashboard", user });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
});

// Add an expense for a specific register_id
app.post('/addExpenses/:registerId', (req, res) => {
  const registerId = req.params.registerId;
  const { title, amount, date, category, description } = req.body;

  const type = "expense";
      
  
  if (!title || !category || !description || !date || isNaN(parseFloat(amount)) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid input data.' });
  }

  const insertQuery = `
    INSERT INTO Expenses (register_id, title, amount, type, date, category, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertQuery,
    [registerId, title, amount, type, date, category, description],
    (err, results) => {
      if (err) {
        console.error('Error inserting expense:', err);
        res.status(500).json({ message: 'Server Error' });
      } else {
        console.log('Expense Added');
        res.status(201).json({ message: 'Expense Added', id: results.insertId });
      }
    }
  );
});


//to read expenses
app.get("/readExpenses/:registerId", (req, res) => {
  const registerId = req.params.registerId;
  const selectQuery = "SELECT * FROM Expenses WHERE register_id = ? ORDER BY date DESC";

  db.query(selectQuery, [registerId], (err, results) => {
    if (err) {
      console.error("Error fetching expenses:", err);
      res.status(500).json({ message: "Server Error" });
    } else {
      console.log("Expenses Retrieved");
      res.status(200).json(results);
    }
  });
});

// Update an expense by ID (excluding type and register_id)
app.put('/updateExpenses/:expenseId', (req, res) => {
  const expenseId = req.params.expenseId;
  const { title, amount, date, category, description } = req.body;

  if (!title || !category || !description || !date || isNaN(parseFloat(amount)) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid input data.' });
  }

  const updateQuery = `
    UPDATE Expenses 
    SET title = ?, amount = ?, date = ?, category = ?, description = ?
    WHERE id = ?
  `;

  db.query(
    updateQuery,
    [title, amount, date, category, description, expenseId],
    (err, result) => {
      if (err) {
        console.error('Error updating expense:', err);
        res.status(500).json({ message: 'Server Error' });
      } else {
        if (result.affectedRows === 0) {
          res.status(404).json({ message: 'Expense not found' });
        } else {
          console.log('Expense Updated');
          res.json({ message: 'Expense Updated' });
        }
      }
    }
  );
});


// Delete an expense by ID
app.delete("/deleteExpenses/:expenseId", (req, res) => {
  const expenseId = req.params.expenseId;
  const deleteQuery = "DELETE FROM Expenses WHERE id = ?";

  db.query(deleteQuery, [expenseId], (err, results) => {
    if (err) {
      console.error("Error deleting expense:", err);
      res.status(500).json({ message: "Server Error" });
    } else {
      if (results.affectedRows === 0) {
        res.status(404).json({ message: "Expense not found" });
      } else {
        console.log("Expense Deleted");
        res.status(200).json({ message: "Expense Deleted" });
      }
    }
  });
});

// Add income for a specific register_id
app.post("/addIncomes/:registerId", (req, res) => {
  const registerId = req.params.registerId;
  const { title, amount, date, category, description } = req.body;

  // const type = "income";

  
  if (
    !title ||
    !category ||
    !description ||
    !date ||
    isNaN(parseFloat(amount)) ||
    amount <= 0
  ) {
    return res.status(400).json({ message: "Invalid input data." });
  }

  const type = "income"

  const insertQuery = `
    INSERT INTO Income (register_id, title, amount, type, date, category, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    insertQuery,
    [registerId, title, amount,type , date, category, description],
    (err, results) => {
      if (err) {
        console.error("Error inserting income:", err);
        res.status(500).json({ message: "Server Error" });
      } else {
        console.log("Income Added");
        res.status(201).json({ message: "Income Added", id: results.insertId });
      }
    }
  );
});

// Retrieve income records for a specific register_id
app.get('/readIncomes/:registerId', (req, res) => {
  const registerId = req.params.registerId;
  const selectQuery = 'SELECT * FROM Income WHERE register_id = ? ORDER BY date DESC';

  db.query(selectQuery, [registerId], (err, results) => {
    if (err) {
      console.error('Error fetching income records:', err);
      res.status(500).json({ message: 'Server Error' });
    } else {
      console.log('Income Records Retrieved');
      res.status(200).json(results);
    }
  });
});

app.put('/updateIncome/:incomeId', (req, res) => {
  const incomeId = req.params.incomeId;
  const { title, amount, date, category, description } = req.body;

  
  if (!title || !category || !description || !date || isNaN(parseFloat(amount)) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid input data.' });
  }

  const updateQuery = `
    UPDATE Income 
    SET title = ?, amount = ?, date = ?, category = ?, description = ?
    WHERE id = ?
  `;

  db.query(
    updateQuery,
    [title, amount, date, category, description, incomeId],
    (err, result) => {
      if (err) {
        console.error('Error updating income:', err);
        res.status(500).json({ message: 'Server Error' });
      } else {
        if (result.affectedRows === 0) {
          res.status(404).json({ message: 'Income not found' });
        } else {
          console.log('Income Updated');
          res.json({ message: 'Income Updated' });
        }
      }
    }
  );
});


// Delete an income record by ID
app.delete('/deleteIncomes/:incomeId', (req, res) => {
  const incomeId = req.params.incomeId;
  const deleteQuery = 'DELETE FROM Income WHERE id = ?';

  db.query(deleteQuery, [incomeId], (err, results) => {
    if (err) {
      console.error('Error deleting income record:', err);
      res.status(500).json({ message: 'Server Error' });
    } else {
      if (results.affectedRows === 0) {
        res.status(404).json({ message: 'Income record not found' });
      } else {
        console.log('Income Record Deleted');
        res.status(200).json({ message: 'Income Record Deleted' });
      }
    }
  });
});



app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logout successful" });
});

app.listen(2001, () => {
  console.log("Listening in port 2001");
});
