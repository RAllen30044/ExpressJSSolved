import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";
import { Dog } from "@prisma/client";

const app = express();

// All code should go below this line
app.use(express.json());
app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200);
});

app.get("/dogs", async (_req, res) => {
  const dogs = await prisma.dog.findMany();
  return res.status(200).send(dogs);
});

app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const dog = await Promise.resolve()
    .then(() =>
      prisma.dog.findUnique({
        where: {
          id,
        },
      })
    )
    .catch(() => {
      null;
    });
  if (dog === null) {
    return res
      .status(204)
      .send({ message: "Dog not found" });
  }
  return res.status(200).send(dog);
});

app.post("/dogs", async (req, res) => {
  const body = req.body;
  const errors = [];
  const validKeys = ["name", "breed", "description", "age"];
  const inputKeys = Object.keys(body);

  // Check for invalid keys
  inputKeys.forEach((key) => {
    if (!validKeys.includes(key)) {
      errors.push(`'${key}' is not a valid key`);
    }
  });

  // Validate fields
  if (typeof body.name !== "string") {
    errors.push("name should be a string");
  }
  if (typeof body.breed !== "string") {
    errors.push("breed should be a string");
  }
  if (typeof body.description !== "string") {
    errors.push("description should be a string");
  }
  if (typeof body.age !== "number" || isNaN(body.age)) {
    errors.push("age should be a number");
  }

  // If there are any errors, return them
  if (errors.length > 0) {
    return res.status(400).send({ errors });
  }
  try {
    const newDog = await prisma.dog.create({
      data: {
        name: body.name,
        age: body.age,
        breed: body.breed,
        description: body.description,
      },
    });
    return res.status(201).send(newDog);
  } catch (err) {
    return res
      .status(500)
      .send({ error: "Internal server error" });
  }
});

app.patch("/dogs/:id", async (req, res) => {
  const id = +req.params.id;

  const body = req.body;
  const errors = [];
  const validKeys = ["name", "breed", "description", "age"];
  const inputKeys = Object.keys(body);

  inputKeys.forEach((key) => {
    if (!validKeys.includes(key)) {
      errors.push(`'${key}' is not a valid key`);
    }
  });

  if ("name" in body && typeof body.name !== "string") {
    errors.push("name should be a string");
  }
  if ("breed" in body && typeof body.breed !== "string") {
    errors.push("breed should be a string");
  }
  if (
    "description" in body &&
    typeof body.description !== "string"
  ) {
    errors.push("description should be a string");
  }
  if (
    "age" in body &&
    (typeof body.age !== "number" || isNaN(body.age))
  ) {
    errors.push("age should be a number");
  }

  if (errors.length > 0) {
    return res.status(400).send({ errors });
  }

  const updateData: Partial<Dog> = {};
  if ("name" in body) updateData.name = body.name;
  if ("breed" in body) updateData.breed = body.breed;
  if ("description" in body)
    updateData.description = body.description;
  if ("age" in body) updateData.age = body.age;
  const updateDog = await Promise.resolve()
    .then(() =>
      prisma.dog.update({
        where: { id },
        data: updateData,
      })
    )
    .catch(() => null);
  if (updateDog === null) {
    return res
      .status(404)
      .send({ message: "Dog not found" });
  }
  return res.status(201).send(updateDog);
});

app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const deleteDog = await Promise.resolve()
    .then(() => {
      return prisma.dog.delete({
        where: {
          id,
        },
      });
    })
    .catch(() => null);
  if (deleteDog === null) {
    return res
      .status(204)
      .send({ message: "Dog not found" });
  }
  return res.status(200).send(deleteDog);
});
// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
