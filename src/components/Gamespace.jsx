import { useState, useEffect } from "react";
import "../App.css";

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
  const test = {
    name: "kleavor",
    src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/900.png",
  };

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
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleClick = (e) => {
    const clickedCardName = e.currentTarget.querySelector("div").textContent;
    shuffleArray(cards);
    setCards(cards);
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
    selectedCards.push(clickedCardName);
    setSelectedCards(selectedCards);
    console.log("Clicked on: " + clickedCardName);
    console.log("Selected Cards: ", selectedCards);
  };

  async function fetcheachPokemon(pokemonArray) {
    let finalPokemonArray = [];
    try {
      for (const pokemon of pokemonArray) {
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
            finalPokemonArray.push(pokemonData);
          }
        }
      }
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
    fetchPokemons().then((pokemons) => {
      console.log(pokemons);
      const pokemonArray = pokemons.results;
      console.log(pokemonArray);

      fetcheachPokemon(pokemonArray).then((detailedPokemons) => {
        console.log("Detailed Pokemons:", detailedPokemons);
        const pokemons = detailedPokemons;
        setPokemonData(pokemons); // 40 pokemons set

        // let cardsData = getRandomCards(pokemons, level);
        // setCards(cardsData);
        // console.log("Cards Data:", cardsData);
      });
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
  }, [level, pokemonData]);

  return (
    <div className="gamespace">
      {cards.map((card) => (
        <div
          key={card.name}
          className="card bg-white p-1.5"
          onClick={handleClick}
        >
          <img
            src={card.src}
            alt={card.name}
            className=""
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="text-white bg-red-700 w-full p-1 rounded-lg text-center capitalize">
            {card.name}
          </div>
        </div>
      ))}
    </div>
  );
}
