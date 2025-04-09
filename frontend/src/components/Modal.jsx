import React from "react";
import { createTodo } from "../api/getAiResponse";

const Modal = ({ inputVal, setInputVal, setFetchTodos }) => {
  return (
    <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Add a Todo</h3>
        <div className="modal-action flex justify-between">
          <form method="dialog" className="flex flex-col w-full">
            {/* if there is a button in form, it will close the modal */}
            <input
              type="text"
              placeholder="Type Todo"
              className="input input-bordered w-full"
              onChange={(e) => setInputVal(e.target.value)}
              value={inputVal}
            />
            <div className="flex justify-between mt-10">
              <button className="btn w-28 mt-5">Close</button>
              <button
                className="btn w-28 mt-5"
                onClick={async() => {
                  await createTodo(inputVal);
                  setFetchTodos("add"); // Fetch the updated todos
                  setInputVal(""); // Clear the input field
                }}
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
