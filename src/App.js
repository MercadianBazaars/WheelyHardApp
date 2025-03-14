import React, { useState, useEffect } from "react";

const SCRYFALL_API = "https://api.scryfall.com/cards/random?q=set:grn&format=json";
const SCRYFALL_SEARCH_API = "https://api.scryfall.com/cards/autocomplete?q=";

export default function MTGGuessingGame() {
  const [card, setCard] = useState(null);
  const [coveredSquares, setCoveredSquares] = useState([]);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guessCount, setGuessCount] = useState(10);
  const [suggestions, setSuggestions] = useState([]);
  const [showFullCard, setShowFullCard] = useState(false);

  useEffect(() => { fetchCard(); }, []);

  const fetchCard = async () => {
    try {
      const response = await fetch(SCRYFALL_API);
      const data = await response.json();
      setCard(data);
      setCoveredSquares([...Array(9).keys()]);
      setGuessCount(10);
      setFeedback("");
      setSuggestions([]);
    } catch (error) {
      console.error(error);
      setFeedback("Error fetching card.");
    }
  };

  const handleGuess = () => {
    if (!card) return;
    if (guess.toLowerCase().trim() === card.name.toLowerCase().trim()) {
      setFeedback("🔥 Magic Abused! 🔥");
      setCoveredSquares([]);
      setShowFullCard(true);
    } else {
      setFeedback("❌ Uh-Oh Stinky");
      revealMore();
      setGuessCount(prev => prevCount - 1);
      setTimeout(() => setFeedback(""), 2000);
    }
    setGuess("");
  };

  const revealMore = () => {
    if (coveredSquares.length > 0) {
      const newPiece = coveredSquares[Math.floor(Math.random() * coveredSquares.length)];
      setCoveredSquares(coveredSquares.filter(i => i !== newPiece));
      if (coveredSquares.length === 1) setShowFullCard(true);
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) return setSuggestions([]);
    try {
      const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${query}`);
      const data = await res.json();
      setSuggestions(data.data);
    } catch (error) {
      console.error(error);
      setSuggestions([]);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Wheely Hard</h1>
      <div style={styles.cardContainer}>
        {card && <img src={card.image_uris.art_crop} style={styles.cardImage} alt="Magic card art" />}
        {coveredSquares.map((i) => <div key={i} style={{ ...styles.coverSquare, ...getSquarePosition(i) }} />)}
      </div>
      <input type="text" value={guess} onChange={(e) => { setGuess(e.target.value); fetchSuggestions(e.target.value); }} onKeyDown={(e) => e.key === "Enter" && handleGuess()} placeholder="Guess..." />
      <a href="https://www.patreon.com/c/MercadianBazaars" target="_blank"><button style={styles.patreonButton}>Support on Patreon</button></a>
      <div style={styles.suggestionsContainer}>
        {suggestions.map((s, i) => (<div key={i} className="suggestion-item" onClick={() => setGuess(suggestions[i])}>{s}</div>))}
      </div>
      <p>Guesses Remaining: {guessCount}</p>
      {feedback && <p>{feedback}</p>}
      {showFullCard && <div style={styles.popup}><button onClick={() => window.location.reload()}>✖</button><img src={card.image_uris.normal} alt={card.name} /></div>}
    </div>
  );
};
