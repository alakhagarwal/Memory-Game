import { useState, useEffect } from "react";
import "../App.css";

// Extracted PokemonCard component to handle individual image loading states
function PokemonCard({ card, handleClick }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      className="card bg-white p-1.5 cursor-pointer relative"
      onClick={() => handleClick(card.name)}
    >
      {/* Loading skeleton - absolute positioned so it doesn't break CSS flex layout */}
      {!imgLoaded && (
        <div className="absolute inset-x-0 top-0 bottom-[40px] flex justify-center items-center z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-700"></div>
        </div>
      )}
      
      <img
        src={card.src}
        alt={card.name}
        className=""
        style={{ opacity: imgLoaded ? 1 : 0 }}
        onLoad={() => setImgLoaded(true)}
        onError={(e) => {
          setImgLoaded(true);
          e.target.style.display = "none";
        }}
      />
      <div className="text-white bg-red-700 w-full p-1 rounded-lg text-center capitalize mt-auto z-20 relative">
        {card.name}
      </div>
    </div>
  );
}

export default function Gamespace({
  score,
  setScore,
  bestScore,
  setBestScore,
  level,
}) {
  let [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  let [pokemonData, setPokemonData] = useState([]); // Set on initial Render
  const [isFetching, setIsFetching] = useState(true); // Tracking overall fetch state

  async function fetchPokemons() {
    let limit = 40;
    let offset = Math.floor(Math.random() * 1000);
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

    try {
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      throw error;
    }
  }

  const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleClick = (clickedCardName) => {
    const shuffledCards = shuffleArray(cards);
    setCards(shuffledCards);
    
    if (selectedCards.includes(clickedCardName)) {
      if (score > bestScore) {
        setBestScore(score);
      }

      setScore(0);
      setSelectedCards([]);
      console.log("Card already selected! Score reset.");
      return;
    }
    setScore(score + 1);
    // New card selected, increment score and add to selected cards
    const newSelectedCards = [...selectedCards, clickedCardName];
    setSelectedCards(newSelectedCards);
    console.log("Clicked on: " + clickedCardName);
    console.log("Selected Cards: ", newSelectedCards);
  };

  async function fetcheachPokemon(pokemonArray) {
    let finalPokemonArray = [];
    try {
      // Changed to Promise.all to fetch concurrently and speed up overall load time
      const fetchPromises = pokemonArray.map(async (pokemon) => {
        let pokemonData = {};
        const pokemonDetails = await fetch(pokemon.url);
        pokemonData["name"] = pokemon.name;
        if (pokemonDetails.ok) {
          const pokemondetailsdata = await pokemonDetails.json();

          // Prioritize higher quality images
          let src =
            pokemondetailsdata["sprites"]["other"]["official-artwork"][
              "front_default"
            ]; //higher quality
          if (!src) {
            src =
              pokemondetailsdata["sprites"]["other"]["dream_world"][
                "front_default"
              ];
          }
          if (!src) {
            src = pokemondetailsdata["sprites"]["front_default"];
          }

          // Skip Pokemon without images
          if (src) {
            pokemonData["src"] = src;
            return pokemonData;
          }
        }
        return null;
      });

      const results = await Promise.all(fetchPromises);
      finalPokemonArray = results.filter((p) => p !== null);

      return finalPokemonArray;
    } catch (error) {
      console.error("Error fetching individual pokemon details:", error);
      throw error;
    }
  }

  function getRandomCards(pokemonData, level) {
    const randomNumbers = [];
    while (randomNumbers.length < level) {
      const randomNumber = Math.floor(Math.random() * pokemonData.length);
      if (!randomNumbers.includes(randomNumber)) {
        randomNumbers.push(randomNumber);
      }
    }

    let cardsData = [];
    randomNumbers.forEach((num) => {
      cardsData.push(pokemonData[num]);
    });

    return cardsData;
  }

  useEffect(() => {
    setIsFetching(true);
    fetchPokemons().then((pokemons) => {
      console.log(pokemons);
      const pokemonArray = pokemons.results;
      console.log(pokemonArray);

      fetcheachPokemon(pokemonArray).then((detailedPokemons) => {
        console.log("Detailed Pokemons:", detailedPokemons);
        const pokemons = detailedPokemons;
        setPokemonData(pokemons); // 40 pokemons set
        setIsFetching(false);
      }).catch(() => {
        setIsFetching(false);
      });
    }).catch(() => {
      setIsFetching(false);
    });
  }, []);

  useEffect(() => {
    if (pokemonData.length > 0) {
      let cardsData = getRandomCards(pokemonData, level);
      setCards(cardsData);
      console.log("Cards Data:", cardsData);
    }
    setScore(0);
    setSelectedCards([]);
  }, [level, pokemonData, setScore]); // added setScore to deps

  return (
    <div className={`gamespace ${isFetching ? 'flex justify-center items-center min-h-[400px]' : ''}`}>
      {isFetching && (
        <div className="flex flex-col items-center justify-center w-full col-span-full mt-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-700 mb-4 mx-auto"></div>
          <p className="text-xl text-white font-bold text-center">Catching Pokémon...</p>
        </div>
      )}
      {!isFetching && cards.map((card) => (
        <PokemonCard key={card.name} card={card} handleClick={handleClick} />
      ))}
    </div>
  );
}
