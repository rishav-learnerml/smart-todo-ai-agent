import Modal from "./components/Modal";
import Navbar from "./components/Navbar";
import Todos from "./components/Todos";
import bot from "./assets/bot.png";
import ReactSiriwave from "react-siriwave";
import { useEffect, useState } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { getAiResponse, getAllTodos } from "./api/getAiResponse";

function App() {
  const [isTouched, setIsTouched] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isListening, setIsListening] = useState(false); // Track listening state
  const [userQuery, setUserQuery] = useState("");
  const [fetchTodos, setFetchTodos] = useState("get");
  const [userTodos, setUserTodos] = useState(null);

  const commands = [
    {
      command: "Lisa On",
      callback: () => {
        setIsTouched(true);
        setAiResponse(
          `Hello Rishav! I'm Lisa! At your Service anytime! Please tell me how can I help you today?`
        );
        const speech = new SpeechSynthesisUtterance(
          "Hello Rishav! I'm Lisa! At your Service! Please tell me how can I help you today?"
        );
        const voices = speechSynthesis.getVoices();
        const lisaVoice = voices[192];
        speech.voice = lisaVoice;
        window.speechSynthesis.speak(speech);
      },
    },
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ commands });

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const handleBotToggle = () => {
    setIsTouched(!isTouched);
    if (!isListening) {
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
    } else {
      SpeechRecognition.stopListening();
      setIsListening(false);
    }
  };

  const handleSubmit = async (input) => {
    try {
      const res = await getAiResponse(input);
      console.log(res, "ai agent response");
      resetTranscript();
      setFetchTodos("ai" + res);
      setAiResponse(res);

      // Stop listening before speaking the response
      SpeechRecognition.stopListening();
      setIsListening(false);

      const speech = new SpeechSynthesisUtterance(res);
      const voices = speechSynthesis.getVoices();
      const lisaVoice = voices[192];
      speech.voice = lisaVoice;

      // Resume listening after the response is spoken
      speech.onend = () => {
        if (isTouched) {
          SpeechRecognition.startListening({ continuous: true });
          setIsListening(true);
        }
      };

      window.speechSynthesis.speak(speech);
    } catch (error) {
      console.error("error", error);

      const speech = new SpeechSynthesisUtterance(
        "Oops! Somethig went wrong . Hold Tight! We are working on it"
      );
      const voices = speechSynthesis.getVoices();
      console.log(voices, "v");
      const lisaVoice = voices[192];
      speech.voice = lisaVoice;

      window.speechSynthesis.speak(speech);
      setAiResponse("Oops! Somethig went wrong!");
    }
  };

  useEffect(() => {
    if (userQuery) {
      handleSubmit(userQuery);
      setUserQuery("");
      resetTranscript(); // Clear the transcript for the next input
    }
  }, [userQuery]);

  useEffect(() => {
    window.speechSynthesis.cancel();
    speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    if (transcript && !listening) {
      setUserQuery(transcript);
      resetTranscript();
    }
  }, [listening]);

  useEffect(() => {
    (async () => {
      const data = await getAllTodos();
      console.log(data);
      console.log(data);
      setUserTodos(data);
      console.log(userTodos);
      setFetchTodos("get");
    })();
  }, [fetchTodos]);

  return (
    <div className="d-flex bg-gray-100">
      <Navbar />
      <Modal
        listening={listening}
        transcript={transcript}
        inputVal={inputVal}
        setInputVal={setInputVal}
        fetchTodos={fetchTodos}
        setFetchTodos={setFetchTodos}
      />
      <div className="todo-area my-10">
        <Todos
          fetchTodos={fetchTodos}
          setFetchTodos={setFetchTodos}
          userTodos={userTodos}
        />
      </div>
      <div
        className="bot-area fixed bottom-1 md:bottom-5 w-36 md:w-52 right-1 cursor-pointer z-10"
        onClick={handleBotToggle} // Toggles listening on bot click
      >
        <img src={bot} alt="bot" />
      </div>
      {isTouched && (
        <div className="fixed md:bottom-5 bottom-0 right-0 md:right-20">
          <ReactSiriwave theme="ios9" />
        </div>
      )}
    </div>
  );
}

export default App;
