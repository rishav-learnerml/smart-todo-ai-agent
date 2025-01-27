import { db } from "./db/index.js";
import { todosTable } from "./db/schema.js";
import { ilike, eq } from "drizzle-orm";
import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI(process.env.OPENAI_API_KEY);

//todos

//read all
async function getAllTodos() {
  const todos = await db.select().from(todosTable);
  return todos;
}

//create
async function createTodo(todo) {
  const [result] = await db
    .insert(todosTable)
    .values({
      todo,
    })
    .returning({ id: todosTable.id });

  return result.id;
}

//read single
async function searchTodo(search) {
  const todos = await db
    .select()
    .from(todosTable)
    .where(ilike(todosTable.todo, search));
  return todos;
}

//delete by id
async function deleteTodoById(id) {
  await db.delete(todosTable).where(eq(todosTable.id, id));
}

//delete all todos

async function deleteAllTodos() {
  await db.delete(todosTable);
}

//update by id
async function updateTodoById(id, todo) {
  console.log(id, todo, "here");
  if (!todo) {
    // Extract `id` and `todo` from the input
    const newid = id.split(",")[0].trim(); // Get the ID and trim whitespace
    const newtodo = id.split(",")[1].trim(); // Get the new todo and trim whitespace

    // Construct the `set` object with the correct column name (adjust `todoColumn` as needed)
    const updateData = { todo: newtodo }; // Replace 'todo' with your actual column name if different
    // Perform the update
    await db.update(todosTable).set(updateData).where(eq(todosTable.id, newid));
  } else {
    // Perform the update
    await db.update(todosTable).set({ todo }).where(eq(todosTable.id, id));
  }

  console.log("Database updated successfully:");
}

const tools = {
  getAllTodos: getAllTodos,
  createTodo: createTodo,
  searchTodo: searchTodo,
  deleteTodoById: deleteTodoById,
  deleteAllTodos: deleteAllTodos,
  updateTodoById: updateTodoById,
};

const SYSTEM_PROMPT = `
You are an AI To-Do List assistant with START, PLAN, ACTION, OBSERVATION and OUTPUT State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take ACTION with appropriate tools and wait for OBSERVATION or OBSERVATIONS based on ACTION.
Once you get OBSERVATION or OBSERVATIONS, Return the AI response based on the START prompt and OBSERVATION or OBSERVATIONS. That will be your OUTPUT state.

You can create, read, update, and delete to-do items. You must strictly follow the JSON output format. Do not ask the user unnecessary questions if not needed. Use the available tools to interact with the database.

Todo DB Schema:
- id: integer, primary key, generated always as identity
- todo: String, not null
- createdAt: Date Time, default now
- updatedAt: Date Time, on update current timestamp

Available Tools:
- getAllTodos(): Returns all the Todos from the database.
- createTodo(todo: string): Creates a new Todo in the database and takes todo as a string and returns the id of the created Todo.
- searchTodo(query: string): Searches for all Todos matching the query string in the database using ilike operator.
- updateTodoById(id: string, todo: string): Updates a Todo by the given id in the database with the new todo string.
- deleteTodoById(id: string): Deletes a Todo by the given id from the database.
- deleteAllTodos(): Deletes all Todos from the database.

Example 1:
START
{"type":"user","user":"Add a task for shopping groceries."}
{"type":"plan","plan":"I will try to get more constext on what the user needs to shop."}
{"type":"output","output":"Can you provide more details on what you need to shop?"}
{"type":"user","user":"I want to shop for milk, eggs, and bread."}
{"type":"plan","plan":"I will use createTodo to create a new todo in DB."}
{"type":"action","function:"createTodo","input":"Shopping for milk, eggs, and bread."}
{"type":"observation","observation":"2"}
{"type":"output","output":"Your Todo has been added successfully."}
{"type":"user","user":"I want to update the todo with id 2."}
{"type":"plan","plan":"I will try to get more context on what the user wants to update."}
{"type":"output","output":"Can you provide more details on what you want to update?"}
{"type":"user","user":"I want to update the todo with id 2 to Shopping for milk, eggs, butter and bread."}
{"type":"plan","plan":"I will use updateTodoById to update the todo in DB."}
{"type":"action","function:"updateTodoById","input":"2, Shopping for milk, eggs, butter and bread."}
{"type":"observation","observation":"2"}
{"type":"output","output":"Your Todo has been updated successfully."}
{"type":"user","user":"I want to delete the todo with id 2."}
{"type":"plan","plan":"I will use deleteTodoById to delete the todo in DB."}
{"type":"action","function:"deleteTodoById","input":"2"}
{"type":"observation","observation":"2"}
{"type":"output","output":"Your Todo has been deleted successfully."}

Example 2:
START
{"type":"user","user":"Add a task to study DSA."}
{"type":"plan","plan":"This query is straigtforward and I will not ask for further contrext. I will use createTodo to create a new todo in DB."}
{"type":"action","function:"createTodo","input":"Study DSA."}
{"type":"observation","observation":"1"}
{"type":"output","output":"Your Todo has been added successfully."}
{"type":"user","user":"I want to search for todos with the keyword DSA."}
{"type":"plan","plan":"I will use searchTodo to search for todos in DB."}
{"type":"action","function:"searchTodo","input":"DSA"}
{"type":"observation","observation":"1"}
{"type":"output","output":"Here are the todos matching the keyword DSA."}
{"type":"output","output":"1. Study DSA."}
{"type":"user","user":"Add a task to study DSA."}
{"type":"plan","plan":"This query is straigtforward and I will not ask for further contrext. I will use createTodo to create a new todo in DB."}
{"type":"action","function:"createTodo","input":"Study DSA."}
{"type":"observation","observation":"1"}
{"type":"output","output":"Your Todo has been added successfully."}
{"type":"user","user":"I want to delete the duplicate todos with the keyword DSA."}
{"type":"plan","plan":"I will use searchTodo to search for todos in DB and then use deleteTodoById to delete the todos."}
{"type":"action","function:"searchTodo","input":"DSA"}
{"type":"observation","observation":"1"}
{"type":"action","function:"deleteTodoById","input":"1"}
{"type":"observation","observation":"1"}
{"type":"output","output":"Your Todo has been deleted successfully."}

Example 3:
{"type":"user","user":"I want to delete all the todos"}
{"type":"plan","plan":"I will delete all the todos in the database using the deleteAllTodos tool."}
{"type":"action","function:"deleteAllTodos"}
{"type":"observation","observation":""}
{"type":"output","output":"All Todos have been deleted successfully."}
`;

const messages = [{ role: "system", content: SYSTEM_PROMPT }];

//create express api-endpoint to interact with the AI and send response back - user will only send the text command and you will send the response back using openai
// Express API endpoint
app.post("/api/ai", async (req, res) => {
  const { query } = req.body;
  console.log(req.body, "query");

  // Add user input to the conversation
  const userMessage = {
    role: "user",
    content: { type: "user", user: query },
  };
  messages.push({ role: "user", content: JSON.stringify(userMessage) });

  try {
    while (true) {
      // Send request to OpenAI's cheaper model (gpt-3.5-turbo)
      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        response_format: { type: "json_object" },
      });

      const assistantMessage = response.choices[0].message.content;
      messages.push({ role: "assistant", content: assistantMessage });

      const action = JSON.parse(assistantMessage);

      console.log("messages", messages);

      if (action.type.toLowerCase() === "output") {
        console.log(action.output);
        res.json({ message: action.output });
        return;
      } else if (action.type.toLowerCase() === "action") {
        const fn = tools[action.function];
        if (!fn) {
          res.json({ message: "Invalid Tool Call!" });
          return;
        }
        console.log(fn, "fn");
        const observation = await fn(action.input);
        const observationMessage = {
          type: "observation",
          observation,
        };
        messages.push({
          role: "assistant",
          content: JSON.stringify(observationMessage),
        });
      } else if (action.type.toLowerCase() === "plan") {
        // Skip sending "plan" to the client; continue loop
        continue;
      } else {
        // Handle unexpected cases
        res
          .status(400)
          .json({ message: "Invalid response type from assistant." });
        return;
      }
    }
  } catch (error) {
    console.error("Error interacting with OpenAI:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while processing your request." });
  }
});

//autofetch todos

app.get("/api/todos", async (req, res) => {
  res.json(await getAllTodos());
});

//other manual crud endpoints
app.post("/api/todos", async (req, res) => {
  const { todo } = req.body;
  const id = await createTodo(todo);
  res.json({ id });
});

app.get("/api/todos/search", async (req, res) => {
  const { query } = req.query;
  res.json(await searchTodo(query));
});

app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  await deleteTodoById(id);
  res.json({ message: "Todo deleted successfully." });
});

app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { todo } = req.body;
  await updateTodoById(id, todo);
  res.json({ message: "Todo updated successfully." });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
