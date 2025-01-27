import Todo from "./Todo";
import loader from "../assets/loader.gif";

const Todos = ({ userTodos, setFetchTodos }) => {
  console.log(userTodos);
  if (!userTodos) {
    return (
      <div className="flex flex-col items-center text-xl h-lvh pt-20">
        <img src={loader} alt="loading..." className="w-42" />
        <div className="text-green-600 mt-2 mb-10">Loading Todos...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mx-10 flex-wrap">
      {userTodos.map((todo,idx) => (
        <Todo
          key={todo.id}
          todo={todo.todo}
          index={todo.id}
          idx={idx}
          setFetchTodos={setFetchTodos}
        />
      ))}
    </div>
  );
};

export default Todos;
