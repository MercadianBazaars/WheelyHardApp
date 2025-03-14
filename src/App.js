import React, { useState, useEffect } from "react";

const SCRYFALL_API = "https://api.scryfall.com/cards/random?q=set:grn&format=json";
const SCRYFALL_SEARCH_API = "https://api.scryfall.com/cards/autocomplete?q=";

export default function MTGGuessingGame() {
  const [card, setCard] = useState(null);
  const [coveredSquares, setCoveredSquares] = useState([]);
  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [guessCount, setGuessCount] = useState(10);
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
      setCoveredSquares(Array.from({ length: 9 }, (_, i) => i)); // Fully cover the image
      setGuess("");
      setSuggestions([]);
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
      setCoveredSquares([]); // Reveal image
      setShowPopup(true);
    } else {
      setFeedback("❌ Uh-Oh Stinky");
      revealMore();
      setGuessCount((prevCount) => prevCount - 1);

      setTimeout(() => {
        setFeedback("");
      }, 2000);
    }

    setGuess("");
    setSuggestions([]);
  };

  const revealMore = () => {
    if (coveredSquares.length > 0) {
      let newPiece;
      do {
        newPiece = Math.floor(Math.random() * 9);
      } while (!coveredSquares.includes(newPiece));

      setCoveredSquares(coveredSquares.filter((piece) => piece !== newPiece));
    }

    if (coveredSquares.length === 1) {
      setShowPopup(true);
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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Wheely Hard</h1>

      {/* IMAGE CONTAINER */}
      <div style={styles.imageContainer}>
        {card && (
          <img src={card.image_uris?.art_crop} alt="Magic Card Art" style={styles.cardImage} />
        )}

        {/* BLACK BLOCKS */}
        {coveredSquares.map((index) => (
          <div key={index} style={{ ...styles.coverSquare, ...getSquarePosition(index) }}></div>
        ))}
      </div>

      {/* INPUT FIELD WITH DROP-DOWN SUGGESTIONS */}
      <div style={{ position: "relative", width: "220px" }}>
        <input
          type="text"
          value={guess}
          onChange={(e) => {
            setGuess(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleGuess()}
          placeholder="Is it Nyx Weaver..."
          style={styles.inputField}
        />
        {suggestions.length > 0 && (
          <div style={styles.dropdown}>
            {suggestions.map((name, index) => (
              <div
                key={index}
                onClick={() => setGuess(name)}
                style={styles.suggestionItem}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PATREON BUTTON */}
      <a href="https://www.patreon.com/c/MercadianBazaars" target="_blank" rel="noopener noreferrer">
        <button style={styles.patreonButton}>❤️ Support on Patreon</button>
      </a>

      {/* GUESS COUNTER */}
      <p style={styles.guessCounter}>Guesses Remaining: {guessCount}</p>

      {/* FEEDBACK MESSAGE */}
      {feedback && (
        <p style={{ ...styles.feedback, opacity: feedback ? 1 : 0 }}>{feedback}</p>
      )}

      {/* POPUP FOR FULL CARD */}
      {showPopup && card && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <button style={styles.closeButton} onClick={() => fetchCard()}>✖</button>
            <img src={card.image_uris?.normal} alt="Magic Card" style={styles.fullCardImage} />
          </div>
        </div>
      )}
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
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    textAlign: "center",
  },
  dropdown: {
    position: "absolute",
    width: "100%",
    backgroundColor: "white",
    border: "1px solid black",
    borderRadius: "5px",
    zIndex: 100,
  },
  suggestionItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid gray",
    color: "black",
    backgroundColor: "white",
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
  },
  guessCounter: {
    marginTop: "10px",
    fontSize: "14px",
  },
  popupOverlay: {
    position: "fixed",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default MTGGuessingGame;
