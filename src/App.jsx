import { useState } from "react";
import "./App.css";
import Gamespace from "./components/Gamespace.jsx";
// Ensure Tailwind CSS is imported in your main CSS file (e.g., index.css or App.css)

function App() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [level, setLevel] = useState(8);

  return (

    <>
    <Head>
      <link rel="icon" type="image/svg+xml" href="./assets/pokeball-pokemon-svgrepo-com.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>PokeGame</title>
    </Head>
    <div className="my-container text-white max-w-[1600px] mx-auto w-full p-4">
      <header className="header-container text-7xl px-10 flex justify-between">
        <h1 className="text-red-700 font-bold ">
          Poke<span className="text-white">Game</span>
        </h1>

        <select
          className="bg-gray-800 text-white text-xl rounded px-4 py-2 mt-6 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-600"
          defaultValue={8}
          onChange={(e) => {
            setLevel(e.target.value);
            console.log("The level is " + e.target.value);
          }}
        >
          <option value={8}>Easy</option>
          <option value={12}>Medium</option>
          <option value={20}>Hard</option>
        </select>
      </header>

      <div className="details text-[1.2rem] details p-10 m-auto text-center">
        <h5>
          Get points by clicking on an image but don't click on any more than
          once!
        </h5>

        <div className="score pt-2 text-2xl">
          <p>
            <span className="text-red-700 text-2xl font-bold">Score :</span> {score}
          </p>
          <p>
            <span className="text-red-700 text-2xl font-bold">Best Score :</span> {bestScore}
          </p>
        </div>

      </div>

      <Gamespace score = {score} setScore = {setScore} bestScore={bestScore} setBestScore = {setBestScore} level = {level}></Gamespace>
    </div>
    </>
  );
}

export default App;
