import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  facets?: FacetsData;
  initialFilters?: FilterState;
}

export interface FilterState {
  genres: string[];
  minPrice: string;
  maxPrice: string;
  formats: string[];
  minYear: string;
  maxYear: string;
}

export interface FacetsData {
  genres: Array<{ value: string; count: number }>;
  priceRange: { min: number; max: number; avg: number };
  formats: Array<{ value: string; count: number }>;
  publicationYears: Array<{ value: number; count: number }>;
}

const FiltersContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterTitle = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  margin-right: 0.75rem;
  cursor: pointer;
  
  input {
    margin-right: 0.5rem;
  }
  
  span {
    color: #666;
    font-size: 0.8rem;
    margin-left: 0.25rem;
  }
`;

const RangeInputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const RangeInput = styled.input`
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const GenreInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const GenreTag = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #e9f0fd;
  border: 1px solid #c8dbf8;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  margin: 0.2rem;
  font-size: 0.8rem;
  
  span {
    margin-right: 0.3rem;
  }
  
  button {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0;
    
    &:hover {
      color: #333;
    }
  }
`;

const GenreSuggestions = styled.div`
  margin-top: 0.5rem;
  
  span {
    display: inline-block;
    background-color: #f8f9fa;
    padding: 0.2rem 0.5rem;
    margin: 0.2rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    color: #333;
    
    &:hover {
      background-color: #e2e6ea;
    }
  }
`;

const GenreTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

const ApplyButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const ResetButton = styled.button`
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
  width: 100%;
  
  &:hover {
    background-color: #e2e6ea;
  }
`;

const MAX_CHECKBOXES_VISIBLE = 5;
const MAX_SUGGESTIONS = 5;

const ShowMoreButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0;
  margin-top: 0.5rem;
  text-decoration: underline;
`;

const BookFilters: React.FC<FilterProps> = ({ onFilterChange, facets, initialFilters }) => {
  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    minPrice: '',
    maxPrice: '',
    formats: [],
    minYear: '',
    maxYear: ''
  });
  
  const [genreInput, setGenreInput] = useState('');
  const [showAllYears, setShowAllYears] = useState(false);
  
  // Inicializar filtros con valores proporcionados
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);
  

  const handleAddGenre = (genre: string) => {
    if (genre.trim() === '') return;
    const trimmedGenre = genre.trim();
    
    if (!filters.genres.some(g => g.toLowerCase() === trimmedGenre.toLowerCase())) {
      setFilters(prev => ({
        ...prev,
        genres: [...prev.genres, trimmedGenre]
      }));
    }
    
    setGenreInput('');
  };
  
  const handleGenreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGenre(genreInput);
    }
  };
  
  const handleRemoveGenre = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
  };
  
  // Filtrar sugerencias de géneros basadas en la entrada - Insensible a mayúsculas/minúsculas
  const getGenreSuggestions = () => {
    if (!facets?.genres || genreInput.trim() === '') return [];
    
    const lowercaseInput = genreInput.toLowerCase();
    
    return facets.genres
      .filter(g => 
        g.value.toLowerCase().includes(lowercaseInput) && 
        !filters.genres.some(selectedGenre => selectedGenre.toLowerCase() === g.value.toLowerCase())
      )
      .slice(0, MAX_SUGGESTIONS);
  };
  
  // Manejar cambios en los filtros de formatos
  const handleFormatChange = (format: string, checked: boolean) => {
    setFilters(prev => {
      if (checked) {
        return { ...prev, formats: [...prev.formats, format] };
      } else {
        return { ...prev, formats: prev.formats.filter(f => f !== format) };
      }
    });
  };
  
  // Manejar cambios en los rangos de precios y años
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Aplicar filtros
  const applyFilters = () => {
    onFilterChange(filters);
  };
  
  // Resetear filtros
  const resetFilters = () => {
    setFilters({
      genres: [],
      minPrice: '',
      maxPrice: '',
      formats: [],
      minYear: '',
      maxYear: ''
    });
    setGenreInput('');
    onFilterChange({
      genres: [],
      minPrice: '',
      maxPrice: '',
      formats: [],
      minYear: '',
      maxYear: ''
    });
  };

  // Sugerencias de géneros filtradas
  const genreSuggestions = getGenreSuggestions();

  // Determinar qué años mostrar según el estado de "mostrar más"
  const displayedYears = facets?.publicationYears 
    ? (showAllYears ? facets.publicationYears : facets.publicationYears.slice(0, MAX_CHECKBOXES_VISIBLE))
    : [];
    
  return (
    <FiltersContainer>
      <FilterSection>
        <FilterTitle>Géneros</FilterTitle>
        <GenreInput
          type="text"
          placeholder="Escribe un género y presiona Enter"
          value={genreInput}
          onChange={(e) => setGenreInput(e.target.value)}
          onKeyDown={handleGenreKeyDown}
        />
        
        <GenreTagsContainer>
          {filters.genres.map(genre => (
            <GenreTag key={genre}>
              <span>{genre}</span>
              <button onClick={() => handleRemoveGenre(genre)}>&times;</button>
            </GenreTag>
          ))}
        </GenreTagsContainer>
        
        {genreSuggestions.length > 0 && (
          <GenreSuggestions>
            {genreSuggestions.map(suggestion => (
              <span 
                key={suggestion.value} 
                onClick={() => handleAddGenre(suggestion.value)}
              >
                {suggestion.value} ({suggestion.count})
              </span>
            ))}
          </GenreSuggestions>
        )}
      </FilterSection>
      
      <FilterSection>
        <FilterTitle>Rango de Precio</FilterTitle>
        <RangeInputGroup>
          <RangeInput
            type="number"
            name="minPrice"
            placeholder="Min"
            value={filters.minPrice}
            onChange={handleRangeChange}
          />
          <span>a</span>
          <RangeInput
            type="number"
            name="maxPrice"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={handleRangeChange}
          />
        </RangeInputGroup>
        {facets?.priceRange && (
          <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
            Rango disponible: ${facets.priceRange.min.toFixed(2)} - ${facets.priceRange.max.toFixed(2)}
          </small>
        )}
      </FilterSection>
      
      <FilterSection>
        <FilterTitle>Formato</FilterTitle>
        <CheckboxGroup>
          {/* Asegurar que facets?.formats existe y tiene elementos */}
          {facets?.formats && facets.formats.length > 0 ? (
            facets.formats.map(format => (
              <CheckboxLabel key={format.value}>
                <input
                  type="checkbox"
                  checked={filters.formats.includes(format.value)}
                  onChange={(e) => handleFormatChange(format.value, e.target.checked)}
                />
                {format.value} {format.count > 0 && <span>({format.count})</span>}
              </CheckboxLabel>
            ))
          ) : (
            <div style={{ color: '#666', fontStyle: 'italic' }}>No hay formatos disponibles</div>
          )}
        </CheckboxGroup>
      </FilterSection>
      
      <FilterSection>
        <FilterTitle>Año de Publicación</FilterTitle>
        <RangeInputGroup>
          <RangeInput
            type="number"
            name="minYear"
            placeholder="Año inicial"
            value={filters.minYear}
            onChange={handleRangeChange}
          />
          <span>a</span>
          <RangeInput
            type="number"
            name="maxYear"
            placeholder="Año final"
            value={filters.maxYear}
            onChange={handleRangeChange}
          />
        </RangeInputGroup>
        
        {facets?.publicationYears && facets.publicationYears.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Años populares:
            </small>
            
            <CheckboxGroup>
              {displayedYears.map(year => (
                <CheckboxLabel key={year.value}>
                  <input
                    type="checkbox"
                    checked={filters.minYear === year.value.toString() && filters.maxYear === year.value.toString()}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({ 
                          ...prev, 
                          minYear: year.value.toString(), 
                          maxYear: year.value.toString() 
                        }));
                      } else if (filters.minYear === year.value.toString() && filters.maxYear === year.value.toString()) {
                        setFilters(prev => ({ ...prev, minYear: '', maxYear: '' }));
                      }
                    }}
                  />
                  {year.value} <span>({year.count})</span>
                </CheckboxLabel>
              ))}
            </CheckboxGroup>
            
            {facets?.publicationYears && facets.publicationYears.length > MAX_CHECKBOXES_VISIBLE && (
              <ShowMoreButton onClick={() => setShowAllYears(!showAllYears)}>
                {showAllYears ? 'Mostrar menos' : `Mostrar más (${facets.publicationYears.length - MAX_CHECKBOXES_VISIBLE})`}
              </ShowMoreButton>
            )}
          </div>
        )}
      </FilterSection>
      
      <ApplyButton onClick={applyFilters}>Aplicar Filtros</ApplyButton>
      <ResetButton onClick={resetFilters}>Resetear Filtros</ResetButton>
    </FiltersContainer>
  );
};

export default BookFilters;