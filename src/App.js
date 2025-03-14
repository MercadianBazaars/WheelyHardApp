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

    if (guess.trim().toLowerCase() === card.name.toLowerCase()) {
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
    setGuessCount(guessCount - 1);
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
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: "100vw",
      height: "100vh",
      backgroundColor: "#8B4513",
      color: "white",
      padding: "20px"
    }}>
      {/* GAME AREA */}
      <div style={{ textAlign: "center", marginRight: "40px" }}>
        <h1>Wheely Hard</h1>

        {/* IMAGE BOX */}
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

          {/* BLACK COVER BLOCKS */}
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

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div style={{
              position: "absolute",
              backgroundColor: "white",
              color: "black",
              border: "1px solid gray",
              width: "250px",
              marginTop: "5px",
              maxHeight: "150px",
              overflowY: "auto",
              textAlign: "left"
            }}>
              {suggestions.map((name, index) => (
                <div key={index} onClick={() => setGuess(name)}
                  style={{ padding: "5px", cursor: "pointer", borderBottom: "1px solid lightgray" }}>
                  {name}
                </div>
              ))}
            </div>
          )}

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

      {/* GUESS TRACKING TABLE */}
      <div style={{ marginLeft: "40px" }}>
        <table style={{
          border: "2px solid white",
          color: "black",
          backgroundColor: "white",
          width: "250px",
          textAlign: "center",
          padding: "10px",
          borderRadius: "5px"
        }}>
          <thead>
            <tr>
              <th>Guess</th>
              <th>Hint</th>
            </tr>
          </thead>
          <tbody>
            {guessHistory.map((entry, index) => (
              <tr key={index}>
                <td style={{ textDecoration: "underline", color: "red" }}>{entry.name}</td>
                <td>{entry.hint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
