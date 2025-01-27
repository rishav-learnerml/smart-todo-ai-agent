import React, { useState } from "react";
import { deleteTodo, updateTodo } from "../api/getAiResponse";

const Todo = ({ index, idx, todo, setFetchTodos }) => {
  const [editable, setEditable] = useState(todo);

  return (
    <div className="card bg-base-100 w-96 shadow-xl my-5 md:mx-5">
      <div className="card-body">
        <h2 className="card-title">
          {idx + 1}.{" "}
          <span
            contentEditable="true"
            suppressContentEditableWarning={true}
            onInput={(e) => {
              setEditable(e.target.textContent); // Use textContent to get the updated value
            }}
          >
            {todo}
          </span>
        </h2>
        <div className="card-actions justify-end mt-5">
          <div className="mr-auto text-gray-500">id: {index}</div>
          <button
            className="btn btn-sm btn-outline btn-info"
            onClick={async () => {
              await updateTodo(index, editable); // Send updated content to the API
              setFetchTodos("update"); // Fetch the updated todos
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-pencil"
            >
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
          <button
            className="btn btn-sm btn-outline btn-error"
            onClick={async () => {
              await deleteTodo(index); // Send updated content to the API
              setFetchTodos("delete"); // Fetch the updated todos
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-trash-2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Todo;
