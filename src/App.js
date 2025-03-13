import React, { useState, useEffect, useRef } from "react";
import "./index.css";

const SCRYFALL_API = "https://api.scryfall.com/cards/random?q=set:grn&format=json";
const SCRYFALL_SEARCH_API = "https://api.scryfall.com/cards/autocomplete?q=";
const PATREON_URL = "https://www.patreon.com/c/MercadianBazaars"; 

export default function MTGGuessingGame() {
  const [card, setCard] = useState(null);
  const [coveredSquares, setCoveredSquares] = useState([]);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guessCount, setGuessCount] = useState(9);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1); // For keyboard navigation
  const [showPopup, setShowPopup] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchCard();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCard = async () => {
    try {
      const response = await fetch(SCRYFALL_API);
      if (!response.ok) throw new Error("Failed to fetch card");
      const data = await response.json();

      setCard(data);
      setCoveredSquares(Array.from({ length: 9 }, (_, i) => i));
      setGuess("");
      setFeedback("");
      setGuessCount(9);
      setSuggestions([]);
      setShowPopup(false);
    } catch (error) {
      console.error("Error fetching card:", error);
      setFeedback("Error loading card. Try again.");
    }
  };

  const handleGuess = () => {
    if (!card) return;

    if (guess.toLowerCase().trim() === card.name.toLowerCase().trim()) {
      setFeedback("🔥 Magic Abused! 🔥");
      setCoveredSquares([]);
      setShowPopup(true);
      setSuggestions([]);
    } else {
      setFeedback("❌ Uh-Oh Stinky");
      revealMore();
    }

    setGuess("");
    setSelectedIndex(-1);
  };

  const revealMore = () => {
    if (coveredSquares.length > 0) {
      let newPiece;
      do {
        newPiece = Math.floor(Math.random() * 9);
      } while (!coveredSquares.includes(newPiece));

      setCoveredSquares(coveredSquares.filter((piece) => piece !== newPiece));
      setGuessCount(guessCount - 1);

      if (guessCount - 1 === 0) {
        setShowPopup(true);
      }
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${SCRYFALL_SEARCH_API}${query}`);
      if (!response.ok) throw new Error("Failed to fetch suggestions");
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
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      setGuess(suggestions[selectedIndex]);
      setSuggestions([]);
      setSelectedIndex(-1);
    } else if (e.key === "Enter") {
      handleGuess();
    }
  };

  const closePopup = () => {
    window.location.reload();
  };

  return (
    <div className="game-container">
      <h1 className="title">Wheely Hard</h1>

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

      <div className="input-container" ref={inputRef}>
        <input
          type="text"
          value={guess}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Is it Nyx Weaver..."
          className="guess-input"
        />

        {suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((name, index) => (
              <div
                key={index}
                onClick={() => {
                  setGuess(name);
                  setSuggestions([]);
                }}
                className={`suggestion-item ${index === selectedIndex ? "selected" : ""}`}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="patreon-button"
        onClick={() => window.open(PATREON_URL, "_blank")}
      >
        ❤️ Support on Patreon
      </button>

      <p className="guess-count">Guesses Remaining: {guessCount}</p>

      {feedback && <p className="feedback">{feedback}</p>}

      {showPopup && card && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-btn" onClick={closePopup}>✖</button>
            <img src={card.image_uris?.normal} alt="Full Card" className="full-card-image" />
          </div>
        </div>
      )}
    </div>
  );
}
