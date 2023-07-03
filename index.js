const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// imp! middleware that checks if there is a build file whenever express gets an HTTP GET to www.myurl.com/index.html or www.myurl.com
app.use(express.static("build"));

morgan.token("body", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return " ";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (req, res) => {
  res.send("<h1>API for person data</h1>");
});

// 3.1: Phonebook backend, step 1
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

// 3.2: Phonebook backend, step 2
app.get("/info", (req, res) => {
  res.send(
    `<div>Phonebook has info for ${
      persons.length
    } people</div><br/><div>${new Date().toString()}</div>`
  );
});

// 3.3: Phonebook backend, step 3
app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

// 3.4: Phonebook backend, step 4
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

// 3.5 + 3.6: Phonebook backend, step 5 + step 6
const generateRandomId = () => {
  let newId = 0;
  while (newId === 0) {
    newId = Math.floor(Math.random() * 1000);
    if (persons.find((p) => p.id === newId)) {
      newId = 0;
    }
  }
  return newId;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "content -name- missing",
    });
  }
  if (!body.number) {
    return response.status(400).json({
      error: "content -number- missing",
    });
  }
  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateRandomId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
