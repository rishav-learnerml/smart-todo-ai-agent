export const getAiResponse = async (message) => {
  console.log(message)
  const response = await fetch("http://localhost:3000/api/ai", {
    method: "POST",
    body: JSON.stringify({
      query: message,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.message;
};

//decare other CRUD functins to call the apis manually
export const createTodo = async (todo) => {
  const response = await fetch("http://localhost:3000/api/todos", {
    method: "POST",
    body: JSON.stringify({ todo }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.id;
};

export const getAllTodos = async () => {
  const response = await fetch("http://localhost:3000/api/todos");
  const data = await response.json();
  return data;
};

export const updateTodo = async (id, todo) => {
  const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify({ todo }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
};

export const deleteTodo = async (id) => {
  const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
};
