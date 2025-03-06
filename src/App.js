import React, { useState, useEffect } from "react";

const SCRYFALL_API = "https://api.scryfall.com/cards/random?q=set:grn&format=json";

export default function MTGGuessingGame() {
  const [card, setCard] = useState(null);
  const [cardArt, setCardArt] = useState(null);
  const [revealedPieces, setRevealedPieces] = useState([]);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFullCard, setShowFullCard] = useState(false);

  useEffect(() => {
    fetchCard();
  }, []);

  useEffect(() => {
    if (showFullCard) {
      setTimeout(() => {
        fetchCard();
      }, 7000);
    }
  }, [showFullCard]);

  const fetchCard = async () => {
    try {
      const response = await fetch(SCRYFALL_API);
      if (!response.ok) throw new Error("Failed to fetch card");
      const data = await response.json();
      setCard(data);
      setCardArt(data.image_uris?.art_crop || null);
      setRevealedPieces([Math.floor(Math.random() * 9)]); // Reveal one random piece initially
      setGuess("");
      setFeedback("");
      setShowFullCard(false);
    } catch (error) {
      console.error("Error fetching card:", error);
      setFeedback("Error loading card. Try again.");
    }
  };

  const handleGuess = () => {
    if (!card) return;
    if (guess.toLowerCase().trim() === card.name.toLowerCase().trim()) {
      setFeedback("Correct!");
      setShowFullCard(true);
    } else {
      setFeedback("Try again!");
    }
  };

  const revealMore = () => {
    if (revealedPieces.length < 9) {
      let newPiece;
      do {
        newPiece = Math.floor(Math.random() * 9);
      } while (revealedPieces.includes(newPiece));
      setRevealedPieces([...revealedPieces, newPiece]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#8B4513] min-h-screen">
      <h1 className="text-xl font-bold mb-4 text-white">MTG Guessing Game</h1>
      <div className="flex items-center gap-4">
        {/* Controls Section on Left */}
        <div className="flex flex-col gap-2">
        <button onClick={handleGuess} disabled={!card} className="p-2 bg-blue-500 text-white rounded">
  submit guess
</button>
          <button onClick={fetchCard}>new card</button>
        </div>
        
        {/* Card Art Section */}
        {cardArt && (
          <div className="relative w-64 h-64 border border-[#8B4513] bg-[#8B4513] overflow-hidden">
            <img
              src={cardArt}
              alt="Magic Card Art"
              className="absolute top-0 left-0 w-full h-full"
            />
            {[...Array(9)].map((_, index) => (
              !revealedPieces.includes(index) && (
                <div
                  key={index}
                  className="absolute bg-[#8B4513]"
                  style={{
                    top: `${Math.floor(index / 3) * (100 / 3)}%`,
                    left: `${(index % 3) * (100 / 3)}%`,
                    width: "calc(33.3% + 10px)",
                    height: "calc(33.3% + 10px)",
                  }}
                ></div>
              )
            ))}
          </div>
        )}
        
        {/* Controls Section on Right */}
        <div className="flex flex-col gap-2">
          <button onClick={revealMore} disabled={revealedPieces.length >= 9 || !card}>
            Peek
          </button>
          <button onClick={() => setShowFullCard(true)} disabled={!card}>
            I TAP...
          </button>
        </div>
      </div>
      
      {/* Guess Section */}
      <div className="flex flex-col items-center mt-4 gap-2">
      <input
  className="p-2 border border-gray-400 w-4/5"
  type="text"
  value={guess}
  onChange={(e) => setGuess(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Enter your guess"/>
        <button onClick={() => window.open('#', '_blank')} className="mt-2">Support on Patreon</button>
      </div>

      {feedback && <p className="mt-2 font-bold text-white">{feedback}</p>}

      {showFullCard && card && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative p-4 bg-white rounded-lg shadow-lg transform scale-50">
            <button className="absolute top-2 right-2 text-lg" onClick={() => setShowFullCard(false)}>
              ✖
            </button>
            <img src={card.image_uris?.normal} alt={card.name} className="w-96" />
          </div>
        </div>
      )}

      {/* Copyright Notice */}
      <p className="mt-4 text-sm text-white">© MercadianBazaars 2025</p>
    </div>
  );
}
