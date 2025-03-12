import React, { useState, useEffect } from "react";
import "./index.css";

const SCRYFALL_API = "https://api.scryfall.com/cards/random?q=set:grn&format=json";
const SCRYFALL_SEARCH_API = "https://api.scryfall.com/cards/autocomplete?q=";

export default function MTGGuessingGame() {
  const [card, setCard] = useState(null);
  const [coveredSquares, setCoveredSquares] = useState([]);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchCard();
  }, []);

  const fetchCard = async () => {
    try {
      const response = await fetch(SCRYFALL_API);
      if (!response.ok) throw new Error("Failed to fetch card");
      const data = await response.json();

      setCard(data);
      setCoveredSquares(Array.from({ length: 9 }, (_, i) => i)); // Fully cover the image

      setGuess("");
      setFeedback("");
      setGuessCount(0);
      setSuggestions([]);
    } catch (error) {
      console.error("Error fetching card:", error);
      setFeedback("Error loading card. Try again.");
    }
  };

  const handleGuess = () => {
    if (!card) return;

    if (guess.toLowerCase().trim() === card.name.toLowerCase().trim()) {
      setFeedback("🔥 Correct! 🔥");
      setCoveredSquares([]); // Reveal image
      setSuggestions([]);
    } else {
      setFeedback("❌ Wrong! Try again.");
      revealMore();
    }

    setGuess("");
  };

  const revealMore = () => {
    if (coveredSquares.length > 0) {
      let newPiece;
      do {
        newPiece = Math.floor(Math.random() * 9);
      } while (!coveredSquares.includes(newPiece));

      setCoveredSquares(coveredSquares.filter((piece) => piece !== newPiece));
      setGuessCount(guessCount + 1);
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${SCRYFALL_SEARCH_API}${query}`);
      const data = await response.json();
      setSuggestions(data.data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setGuess(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (name) => {
    setGuess(name);
    setSuggestions([]);
  };

  return (
    <div className="game-container">
      <h1 className="title">MTG Guessing Game</h1>

      <div className="image-frame">
        {card && (
          <img
            src={card.image_uris?.art_crop}
            alt="Magic Card Art"
            className="card-image"
          />
        )}

        {coveredSquares.map((index) => (
          <div key={index} className="cover-square" style={{
            top: `${Math.floor(index / 3) * 33.33}%`,
            left: `${(index % 3) * 33.33}%`
          }}></div>
        ))}
      </div>

      <div className="autocomplete-container">
        <input
          type="text"
          value={guess}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleGuess()}
          placeholder="Enter your guess..."
          className="guess-input"
        />

        {suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((name, index) => (
              <div key={index} onClick={() => handleSuggestionClick(name)} className="suggestion-item">
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="guess-count">Incorrect Guesses: {guessCount}</p>

      {feedback && <p className="feedback">{feedback}</p>}
    </div>
  );
}
