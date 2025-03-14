import React, { useState, useEffect } from "react";

const SCRYFALL_API = "https://api.scryfall.com/cards/random?q=set:grn&format=json";
const SCRYFALL_SEARCH_API = "https://api.scryfall.com/cards/autocomplete?q=";
const SCRYFALL_CARD_API = "https://api.scryfall.com/cards/named?exact=";

export default function MTGGuessingGame() {
  const [card, setCard] = useState(null);
  const [coveredSquares, setCoveredSquares] = useState([]);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guessCount, setGuessCount] = useState(10);
  const [suggestions, setSuggestions] = useState([]);
  const [guessHistory, setGuessHistory] = useState([]);

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
      setGuessHistory([]);
    } catch (error) {
      console.error("Error fetching card:", error);
      setFeedback("Error loading card. Try again.");
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

  const fetchCardDetails = async (cardName) => {
    try {
      const response = await fetch(`${SCRYFALL_CARD_API}${cardName}`);
      if (!response.ok) throw new Error("Card details not found");
      return await response.json();
    } catch (error) {
      console.error("Error fetching card details:", error);
      return null;
    }
  };

  const handleGuess = async () => {
    if (!card || guess.trim() === "") return;

    const guessedCard = await fetchCardDetails(guess.trim());
    if (!guessedCard) return;

    let hint = "";

    if (guess.trim().toLowerCase() === card.name.toLowerCase().trim()) {
      setFeedback("🔥 Magic Abused! 🔥");
      setCoveredSquares([]);
      hint = "✅ Correct";
    } else {
      const guessedDate = new Date(guessedCard.released_at);
      const actualDate = new Date(card.released_at);

      if (guessedDate > actualDate) {
        hint = "⬅️ Older";
      } else if (guessedDate < actualDate) {
        hint = "➡️ Newer";
      } else {
        hint = "🤷 Unknown";
      }

      revealMore();
    }

    setGuessHistory([...guessHistory, { name: guess, hint }]);
    setGuess("");
    setGuessCount((prev) => Math.max(prev - 1, 0));
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
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100vw",
      height: "100vh",
      backgroundColor: "#8B4513",
      color: "white",
      padding: "20px",
      gap: "50px"
    }}>
      {/* MAIN GAME AREA */}
      <div style={{ textAlign: "center" }}>
        <h1>Wheely Hard</h1>

        {/* IMAGE DISPLAY */}
        <div style={{
          position: "relative",
          width: "300px",
          height: "420px",
          border: "4px solid white",
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
                objectFit: "cover",
                display: "block"
              }}
            />
          )}

          {/* BLACK BLOCKS */}
          {coveredSquares.map((index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                top: `${Math.floor(index / 3) * 33.33}%`,
                left: `${(index % 3) * 33.33}%`,
                width: "34%",
                height: "34%",
                backgroundColor: "black",
                zIndex: 10
              }}
            ></div>
          ))}
        </div>

        {/* INPUT FIELD + PATREON */}
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <input
            type="text"
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleGuess()}
            placeholder="Is it Nyx Weaver..."
            style={{
              padding: "10px",
              fontSize: "16px",
              width: "250px",
              textAlign: "center",
              borderRadius: "5px"
            }}
          />

          <button onClick={() => window.open("https://www.patreon.com/c/MercadianBazaars", "_blank")}
            style={{
              marginTop: "10px",
              backgroundColor: "#FF424D",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer"
            }}>
            ❤️ Support on Patreon
          </button>

          <p>Guesses Remaining: {guessCount}</p>
        </div>
      </div>

      {/* TABLE TO TRACK GUESSES */}
      <div>
        <table style={{
          borderCollapse: "collapse",
          width: "250px",
          backgroundColor: "white",
          color: "black",
          borderRadius: "5px",
          overflow: "hidden",
          textAlign: "center",
          boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.2)"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#ddd" }}>
              <th style={{ padding: "10px", borderBottom: "2px solid black" }}>Guess</th>
              <th style={{ padding: "10px", borderBottom: "2px solid black" }}>Hint</th>
            </tr>
          </thead>
          <tbody>
            {guessHistory.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ padding: "10px" }}>No guesses yet</td>
              </tr>
            ) : (
              guessHistory.map((entry, index) => (
                <tr key={index}>
                  <td style={{ padding: "8px", borderBottom: "1px solid gray" }}>{entry.name}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid gray" }}>{entry.hint}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
