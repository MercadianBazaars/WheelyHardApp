import React, { useState, useEffect } from "react";

const SCRYFALL_API = "https://api.scryfall.com/cards/random?q=set:grn&format=json";

export default function MTGGuessingGame() {
  const [card, setCard] = useState(null);
  const [coveredSquares, setCoveredSquares] = useState([]);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guessCount, setGuessCount] = useState(10); // Starts at 10, decreases with each wrong guess

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
      setGuessCount(10);
    } catch (error) {
      console.error("Error fetching card:", error);
      setFeedback("Error loading card. Try again.");
    }
  };

  const handleGuess = () => {
    if (!card) return;

    if (guess.toLowerCase().trim() === card.name.toLowerCase().trim()) {
      setFeedback("🔥 Magic Abused! 🔥");
      setCoveredSquares([]); // Reveal image
    } else {
      setFeedback("❌ Uh-Oh Stinky");
      revealMore();
      setGuessCount((prevCount) => prevCount - 1); // Reduce guess count

      // Automatically remove feedback after 2 seconds
      setTimeout(() => {
        setFeedback("");
      }, 2000);
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
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Wheely Hard</h1>

      {/* IMAGE CONTAINER WITH PERFECT FIT */}
      <div style={styles.imageContainer}>
        {card && (
          <img
            src={card.image_uris?.art_crop}
            alt="Magic Card Art"
            style={styles.cardImage}
          />
        )}

        {/* BLACK BLOCKS THAT HIDE THE IMAGE */}
        {coveredSquares.map((index) => (
          <div key={index} style={{ ...styles.coverSquare, ...getSquarePosition(index) }}></div>
        ))}
      </div>

      {/* INPUT FIELD */}
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleGuess()}
        placeholder="Is it Nyx Weaver..."
        style={styles.inputField}
      />

      {/* PATREON BUTTON */}
      <a href="https://www.patreon.com/c/MercadianBazaars" target="_blank" rel="noopener noreferrer">
        <button style={styles.patreonButton}>❤️ Support on Patreon</button>
      </a>

      {/* GUESS COUNTER */}
      <p style={styles.guessCounter}>Guesses Remaining: {guessCount}</p>

      {/* FEEDBACK MESSAGE */}
      <p className={`feedback ${feedback ? "" : "hidden"}`} style={styles.feedback}>
        {feedback}
      </p>
    </div>
  );
}

// FUNCTION TO POSITION BLACK SQUARES
const getSquarePosition = (index) => ({
  position: "absolute",
  top: `${Math.floor(index / 3) * 33.33}%`,
  left: `${(index % 3) * 33.33}%`,
  width: "34%",
  height: "34%",
  backgroundColor: "black",
  zIndex: 10,
});

// CSS-IN-JS STYLES
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#8B4513",
    color: "white",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  imageContainer: {
    position: "relative",
    width: "300px",
    height: "420px",
    border: "4px solid white",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  coverSquare: {
    position: "absolute",
  },
  inputField: {
    marginTop: "20px",
    padding: "10px",
    fontSize: "16px",
    width: "200px",
    textAlign: "center",
    borderRadius: "5px",
  },
  patreonButton: {
    marginTop: "10px",
    backgroundColor: "#FF424D",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
  },
  guessCounter: {
    marginTop: "10px",
    fontSize: "14px",
  },
  feedback: {
    marginTop: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    opacity: 1,
    transition: "opacity 1s ease-in-out",
  },
};

export default MTGGuessingGame;
