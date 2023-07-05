const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

// imp! import dotenv before person model
const Person = require("./models/person");
const { request, response } = require("express");

const errorHandler = (error, request, response, next) => {
  console.log("errorHandler invoked");
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// imp! middleware that checks if there is a build file whenever express gets an HTTP GET to www.myurl.com/index.html or www.myurl.com
app.use(express.static("build"));
app.use(express.json());
app.use(cors());

morgan.token("body", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return " ";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/", (req, res) => {
  res.send("<h1>API for person data</h1>");
});

// 3.1: Phonebook backend, step 1
// app.get("/api/persons", (req, res) => {
//   res.json(persons);
// });

// 3.13 Phonebook database, step 1
app.get("/api/persons/", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

// 3.2: Phonebook backend, step 2 / 3.18*: Phonebook database, step 6
app.get("/info", (req, res) => {
  Person.find({}).then((persons) => {
    res.send(
      `<div>Phonebook has info for ${
        persons.length
      } people</div><br/><div>${new Date().toString()}</div>`
    );
  });
});

// 3.3: Phonebook backend, step 3
// app.get("/api/persons/:id", (req, res) => {
//   const id = Number(req.params.id);
//   const person = persons.find((person) => person.id === id);
//
//   if (person) {
//     res.json(person);
//   } else {
//     res.status(404).end();
//   }
// });

// 3.13 Phonebook database, step 1
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      console.log("finding person");
      if (person) {
        response.json(person);
      } else {
        console.log("person is undefined");
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// 3.4: Phonebook backend, step 4
// app.delete("/api/persons/:id", (req, res) => {
//   const id = Number(req.params.id);
//   persons = persons.filter((person) => person.id !== id);
//
//   res.status(204).end();
// });

// 3.15: Phonebook database, step 3
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// 3.5 + 3.6: Phonebook backend, step 5 + step 6
// const generateRandomId = () => {
//   let newId = 0;
//   while (newId === 0) {
//     newId = Math.floor(Math.random() * 1000);
//     if (persons.find((p) => p.id === newId)) {
//       newId = 0;
//     }
//   }
//   return newId;
// };
// // app.post("/api/persons", (request, response) => {
//   const body = request.body;
//
//   if (!body.name) {
//     return response.status(400).json({
//       error: "content -name- missing",
//     });
//   }
//   if (!body.number) {
//     return response.status(400).json({
//       error: "content -number- missing",
//     });
//   }
//   if (persons.find((person) => person.name === body.name)) {
//     return response.status(400).json({
//       error: "name must be unique",
//     });
//   }
//
//   const person = {
//     id: generateRandomId(),
//     name: body.name,
//     number: body.number,
//   };
//
//   persons = persons.concat(person);
//
//   response.json(person);
// });

// 3.13 Phonebook database, step 1
app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (body.name === "" || body.number === "") {
    return response
      .status(400)
      .json({ error: "please provide name and number" });
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

// 3.17*: Phonebook database, step 5
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
