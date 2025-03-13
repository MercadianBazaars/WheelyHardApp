import React, { useState, useEffect } from "react";
import "./index.css";
import D10Dice from "./D10Dice"; // Import the 3D d10 dice component

const SCRYFALL_API = "https://api.scryfall.com/cards/random?q=set:grn&format=json";
const PATREON_URL = "https://www.patreon.com/c/MercadianBazaars";

export default function MTGGuessingGame() {
  const [card, setCard] = useState(null);
  const [coveredSquares, setCoveredSquares] = useState([]);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guessCount, setGuessCount] = useState(10);
  const [showPopup, setShowPopup] = useState(false);
  const [incorrectGuesses, setIncorrectGuesses] = useState([]); // Stores incorrect guesses

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
      setIncorrectGuesses([]); // Reset incorrect guesses on new card
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
      setIncorrectGuesses((prev) => [...prev, guess]); // Store incorrect guess
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
      setGuessCount((prev) => Math.max(prev - 1, 0));

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

      {/* Layout: Dice on the Left, Image in the Center, Table on the Right */}
      <div className="game-content">
        {/* 3D DICE ON THE LEFT */}
        <div className="dice-container">
          <D10Dice guessCount={guessCount} />
        </div>

        {/* IMAGE IN THE CENTER */}
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

        {/* INCORRECT GUESSES TABLE ON THE RIGHT */}
        <div className="guess-table">
          <h2>❌ Incorrect Guesses</h2>
          <ul>
            {incorrectGuesses.length === 0 ? (
              <li>No incorrect guesses yet</li>
            ) : (
              incorrectGuesses.map((word, index) => <li key={index}>{word}</li>)
            )}
          </ul>
        </div>
      </div>

      {/* Guess Input */}
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleGuess()}
        placeholder="Enter your guess..."
        className="guess-input"
      />

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
