const mongoose = require("mongoose");

const password = encodeURIComponent(process.argv[2]);
const url = `mongodb+srv://sarahfullstack:${password}@full-stack-open-part3c.mwctwwg.mongodb.net/noteApp?retryWrites=true&w=majority`;
mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
} else {
  if (process.argv[3] === undefined || process.argv[4] === undefined) {
    console.log("give number and name as argument");
    process.exit(1);
  }

  const person1 = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  person1.save().then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
}
