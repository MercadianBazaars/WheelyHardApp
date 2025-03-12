import React, { useState, useEffect } from "react";

const SCRYFALL_API = "https://api.scryfall.com/cards/random?q=set:grn&format=json";

export default function MTGGuessingGame() {
  const [card, setCard] = useState(null);
  const [coveredSquares, setCoveredSquares] = useState([]);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guessCount, setGuessCount] = useState(0);

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

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100vw",
      height: "100vh",
      backgroundColor: "#8B4513",
      color: "white"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>MTG Guessing Game</h1>

      {/* IMAGE CONTAINER WITH PERFECT FIT */}
      <div style={{
        position: "relative",
        width: "300px",
        height: "420px",
        border: "4px solid white",
        boxSizing: "border-box",  // Ensures image fits inside the border
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {card && (
          <img
            src={card.image_uris?.art_crop}
            alt="Magic Card Art"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",  // Ensures perfect fit without stretching
              display: "block"
            }}
          />
        )}

        {/* BLACK BLOCKS THAT HIDE THE IMAGE */}
        {coveredSquares.map((index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: `${Math.floor(index / 3) * 33.33}%`,
              left: `${(index % 3) * 33.33}%`,
              width: "34%",  // Slightly oversized to remove any gaps
              height: "34%",
              backgroundColor: "black",
              zIndex: 10
            }}
          ></div>
        ))}
      </div>

      {/* INPUT FIELD */}
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleGuess()}
        placeholder="Enter your guess..."
        style={{
          marginTop: "20px",
          padding: "10px",
          fontSize: "16px",
          width: "200px",
          textAlign: "center",
          borderRadius: "5px"
        }}
      />

      <p style={{ marginTop: "10px", fontSize: "14px" }}>Incorrect Guesses: {guessCount}</p>

      {feedback && <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "bold" }}>{feedback}</p>}
    </div>
  );
}
