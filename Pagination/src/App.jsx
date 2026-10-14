import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  
  const [allResults, setAllResults] = useState([]); // Raw search results from API
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to show per page

  // 1. Fetch available categories on initial mount (for the filter dropdown)
  useEffect(() => {
    fetch('https://dummyjson.com/products/categories')
      .then((res) => res.json())
      .then((data) => {
        // DummyJSON categories can be strings or objects depending on version, handle safely
        setCategories(data);
      })
      .catch((err) => console.error('Failed to fetch categories', err));
  }, []);

  // 2. Debounced Search API call
  useEffect(() => {
    // If input is empty, clear results
    if (!inputText.trim()) {
      setAllResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      // Fetching up to 50 items so we can filter and paginate client-side smoothly
      fetch(`https://dummyjson.com/products/search?q=${inputText}&limit=50`)
        .then((response) => response.json())
        .then((data) => {
          setAllResults(data.products || []);
          setLoading(false);
          setCurrentPage(1); // Reset to page 1 on new search query
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [inputText]);

  // --- PIPELINE STEP 1: Filter by Category ---
  const filteredResults = allResults.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  // --- PIPELINE STEP 2: Calculate Pagination ---
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPaginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  // Handle category change (resets pagination to page 1)
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>Product Search, Filter & Pagination</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Type to search products..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', fontSize: '16px' }}
      />

      {/* Filter Dropdown */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="category-select" style={{ marginRight: '10px' }}>Filter by Category:</label>
        <select 
          id="category-select"
          value={selectedCategory} 
          onChange={handleCategoryChange}
          style={{ padding: '6px', fontSize: '14px' }}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => {
            // DummyJSON category structure can be a string or object with slug/name
            const catSlug = typeof cat === 'string' ? cat : cat.slug;
            const catName = typeof cat === 'string' ? cat : cat.name;
            return (
              <option key={catSlug} value={catSlug}>
                {catName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Loading indicator */}
      {loading && <p>Loading...</p>}

      {/* Results List */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {currentPaginatedResults.map((item) => (
          <li key={item.id} style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>{item.title}</strong></span>
            <span style={{ color: '#666' }}>${item.price} | Category: {item.category}</span>
          </li>
        ))}
      </ul>

      {/* Empty State */}
      {!loading && inputText && filteredResults.length === 0 && (
        <p>No results found for your search/filter criteria.</p>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: '6px 12px' }}
          >
            Previous
          </button>
          
          <span>Page {currentPage} of {totalPages}</span>

          <button 
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ padding: '6px 12px' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default App;