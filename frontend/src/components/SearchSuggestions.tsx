import React from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';

// Interfaces
export interface Suggestion {
  _id: string;
  title: string;
  author: string;
  coverImageUrl?: string;
}

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: Suggestion) => void;
  inputRef: React.RefObject<any>;
}

// Styled Components
const SuggestionsContainer = styled.div`
  position: absolute;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  top: 100%;
  left: 0;
`;

const SuggestionItem = styled.div`
  display: flex;
  padding: 0.75rem;
  align-items: center;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SuggestionImage = styled.img`
  width: 40px;
  height: 60px;
  object-fit: cover;
  margin-right: 0.75rem;
`;

const SuggestionInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  h4 {
    margin: 0;
    font-size: 0.9rem;
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    color: #666;
  }
`;

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ query, onSelect, inputRef }) => {
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/suggestions?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce para evitar demasiadas llamadas mientras el usuario escribe
    const timerId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timerId);
  }, [query]);

  // Si no hay sugerencias o la consulta es muy corta, no mostramos nada
  if (suggestions.length === 0 || query.trim().length < 2) {
    return null;
  }

  return (
    <SuggestionsContainer>
      {loading ? (
        <SuggestionItem>Buscando sugerencias...</SuggestionItem>
      ) : (
        suggestions.map((suggestion) => (
          <SuggestionItem 
            key={suggestion._id}
            onClick={() => onSelect(suggestion)}
          >
            {suggestion.coverImageUrl && (
              <SuggestionImage 
                src={suggestion.coverImageUrl} 
                alt={suggestion.title} 
              />
            )}
            <SuggestionInfo>
              <h4>{suggestion.title}</h4>
              <p>{suggestion.author}</p>
            </SuggestionInfo>
          </SuggestionItem>
        ))
      )}
    </SuggestionsContainer>
  );
};

export default SearchSuggestions;