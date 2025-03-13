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
  const [guessCount, setGuessCount] = useState(10);
  const [rolling, setRolling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchCard();
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
      setGuessCount(10);
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
    } else {
      setFeedback("❌ Uh-Oh Stinky");
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

      // Animate the d10 rolling effect
      setRolling(true);
      setTimeout(() => {
        setGuessCount((prev) => prev - 1);
        setRolling(false);
      }, 300);

      if (guessCount - 1 === 1) {
        setShowPopup(true);
      }
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
          <img src={card.image_uris?.art_crop} alt="Magic Card Art" className="card-image" />
        )}

        {coveredSquares.map((index) => (
          <div key={index} className="cover-square" style={{
            top: `${Math.floor(index / 3) * 33.33}%`,
            left: `${(index % 3) * 33.33}%`
          }}></div>
        ))}
      </div>

      {/* Animated D10 Counter */}
      <div className={`d10-counter ${rolling ? "roll" : ""}`}>{guessCount}</div>

      <button className="patreon-button" onClick={() => window.open(PATREON_URL, "_blank")}>
        ❤️ Support on Patreon
      </button>

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
