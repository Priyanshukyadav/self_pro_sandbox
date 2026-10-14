import { useEffect, useState } from 'react';
import './App.css';

function App() {
  // 1. Fixed camelCase naming
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If input is empty, clear results
    if (!inputText.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    // Debounce timer
    const timer = setTimeout(() => {
      fetch(`https://dummyjson.com/products/search?q=${inputText}`)
        .then((response) => response.json())
        .then((data) => {
          setResults(data.products || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [inputText]) ;
  
  return (
    <div>
      <h1>Search App</h1>

      {/* Input box connected to state */}
      <input
        type="text"
        placeholder="Type to search..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      {/* Loading indicator */}
      {loading && <p>Loading...</p>}

      {/* Results list */}
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>

      {/* Empty state message */}
      {!loading && inputText && results.length === 0 && (
        <p>No results found</p>
      )}
    </div>
  );
}

export default App;