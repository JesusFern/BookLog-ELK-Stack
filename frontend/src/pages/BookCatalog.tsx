import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SearchSuggestions, { Suggestion } from '../components/SearchSuggestions';
import BookFilters, { FilterState, FacetsData } from '../components/BookFilters';
import PopularBooks from '../components/PopularBooks';

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  summary?: string;
  language: string;
  price: number;
  format: string[];
  coverImageUrl?: string;
  publishedYear?: number;
  numPages?: number;
}

const CatalogWrapper = styled.div`
  padding: 2rem;
  background-color: #f8f8f8;
  min-height: 100vh;
`;

const CatalogLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FiltersColumn = styled.div`
  @media (max-width: 768px) {
    display: none; // Ocultar en móviles
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.25rem;
`;

const BookCard = styled(Link)`
  background: white;
  border-radius: 10px;
  padding: 0.75rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.88rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;
  h3 {
    margin: 0.3rem 0 0.2rem 0;
    font-size: 1rem;
  }
  p {
    margin: 0.1rem 0;
    line-height: 1.2;
  }
  &:hover {
    transform: translateY(-4px);
  }
`;

const BookImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 6px;
`;

const Pagination = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const PageButton = styled.button<{ disabled?: boolean }>`
  background-color: ${({ disabled }) => (disabled ? '#ccc' : '#007bff')};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 6px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const PageInput = styled.input`
  width: 60px;
  padding: 0.3rem 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-align: center;
`;

const SearchBar = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 300px;
`;

const SearchButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
`;

const SearchBarContainer = styled.div`
  position: relative;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;


const BookCatalog = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [facets, setFacets] = useState<FacetsData | undefined>(undefined);
  const [activeSearch, setActiveSearch] = useState(false);

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    genres: [],
    minPrice: '',
    maxPrice: '',
    formats: [],
    minYear: '',
    maxYear: ''
  });

  // Referencia para el contenedor de búsqueda
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Efecto para cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    setIsLoading(true);
    setActiveSearch(false);
    fetch(`${API_BASE_URL}/api/books/books`)
      .then(res => res.json())
      .then(data => {
        setBooks(data.results ?? []);
        setTotalResults(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setCurrentPage(data.page ?? 1);
        setPageInput(data.page?.toString() ?? '1');
        setIsLoading(false);
        setFacets(data.facets ?? {});
      })
      .catch(err => {
        console.error('Error al cargar libros:', err);
        setIsLoading(false);
      });
  };
  const handleFilterChange = (newFilters: FilterState) => {
    setActiveFilters(newFilters);
    searchWithFilters(searchQuery, newFilters, 1);
  };

  // Función para realizar la búsqueda con filtros
  const searchWithFilters = (query: string, filters: FilterState, page: number) => {
    setIsLoading(true);
    
    // Construir la URL con los parámetros de filtros
    let url = new URL(`${API_BASE_URL}/api/books/search/filters`);
    
    // Añadir query si existe
    if (query && query.trim() !== '') {
      url.searchParams.append('query', query);
    }
    
    // Añadir filtros de géneros
    if (filters.genres.length > 0) {
      url.searchParams.append('genres', filters.genres.join(','));
    }
    
    // Añadir filtros de precio
    if (filters.minPrice && filters.minPrice.trim() !== '') {
      url.searchParams.append('minPrice', filters.minPrice);
    }
    
    if (filters.maxPrice && filters.maxPrice.trim() !== '') {
      url.searchParams.append('maxPrice', filters.maxPrice);
    }
    
    // Añadir filtros de formato
    if (filters.formats.length > 0) {
      url.searchParams.append('formats', filters.formats.join(','));
    }
    
    // Añadir filtros de año
    if (filters.minYear && filters.minYear.trim() !== '') {
      url.searchParams.append('minYear', filters.minYear);
    }
    
    if (filters.maxYear && filters.maxYear.trim() !== '') {
      url.searchParams.append('maxYear', filters.maxYear);
    }
    
    // Añadir página
    url.searchParams.append('page', page.toString());
    
    // Realizar la búsqueda
    fetch(url.toString())
      .then(res => res.json())
      .then(data => {
        setBooks(data.results || []);
        setCurrentPage(data.page || 1);
        setPageInput(data.page.toString() || '1');
        setTotalResults(data.total || 0);
        setTotalPages(data.totalPages || 0);
        setFacets(data.facets);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error al buscar con filtros:', err);
        setIsLoading(false);
      });
  };

  // Función para realizar la búsqueda básica (mantiene los filtros)
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setActiveSearch(true);
    }
    searchWithFilters(searchQuery, activeFilters, 1);
  };

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setIsLoading(true);
      
      // Si hay una búsqueda activa o filtros, usar searchWithFilters
      if (searchQuery || Object.values(activeFilters).some(val => 
        Array.isArray(val) ? val.length > 0 : val !== '')) {
        searchWithFilters(searchQuery, activeFilters, newPage);
      } else {
        // Cargar libros normales con paginación
        fetch(`${API_BASE_URL}/api/books/books?page=${newPage}&size=20`)
          .then(res => res.json())
          .then(data => {
            setBooks(data.results ?? []);
            setCurrentPage(data.page ?? newPage);
            setPageInput(data.page?.toString() ?? newPage.toString());
            setTotalResults(data.total ?? 0);
            setTotalPages(data.totalPages ?? 1);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Error cambiando de página:', err);
            setIsLoading(false);
          });
      }
    }
  };

  // Funciones de paginación
  const nextPage = () => changePage(currentPage + 1);
  const prevPage = () => changePage(currentPage - 1);
  
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(pageInput);
      if (!isNaN(pageNumber)) {
        changePage(pageNumber);
      }
    }
  };

  const shouldShowPopularBooks = () => {
    // No mostrar libros populares si hay una búsqueda o filtros activos
    const hasActiveFilters = Object.values(activeFilters).some(val => 
      Array.isArray(val) ? val.length > 0 : val !== '');
      
    return !activeSearch && !hasActiveFilters;
  };


  const handleAddToCartById = async (bookId: string) => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('Debes iniciar sesión para añadir libros al carrito.');
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('✅ Libro añadido al carrito.');
      } else {
        console.error('❌ Backend respondió con error:', data);
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message || 'Algo salió mal'}`);
    }
  };
  
  // Mantener el handler original para los libros del catálogo
  const handleAddToCart = (book: Book) => {
    handleAddToCartById(book._id);
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    setActiveSearch(true);
    
    searchWithFilters(suggestion.title, activeFilters, 1);
  };

  const currentBooks = books;

  return (
    <>
      <Header />
      <CatalogWrapper>
        <SearchBarContainer ref={searchContainerRef}>
          <SearchBar>
            <SearchInput 
              type="text" 
              placeholder="Buscar libros..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                if (e.target.value === '') {
                  setActiveSearch(false);
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
                if (e.key === 'Escape') setShowSuggestions(false);
              }}
            />
            <SearchButton onClick={handleSearch}>Buscar</SearchButton>
          </SearchBar>
          
          {showSuggestions && (
            <SearchSuggestions 
              query={searchQuery}
              onSelect={handleSuggestionSelect}
              inputRef={searchContainerRef as React.RefObject<HTMLDivElement>}
            />
          )}
        </SearchBarContainer>

        {shouldShowPopularBooks() && (
          <PopularBooks onAddToCart={handleAddToCartById} />
        )}

        <CatalogLayout>
          <FiltersColumn>
            <BookFilters 
              onFilterChange={handleFilterChange}
              facets={facets}
              initialFilters={activeFilters}
            />
          </FiltersColumn>
          
          <div>
            {isLoading ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</p>
            ) : (
              <>
                <p style={{ marginBottom: '1rem' }}>
                  {totalResults > 0 ? (
                    `Mostrando ${(currentPage - 1) * 20 + 1}-${Math.min(currentPage * 20, totalResults)} de ${totalResults} resultados`
                  ) : (
                    'No se encontraron resultados'
                  )}
                </p>
                
                <Grid>
                  {currentBooks.length > 0 ? (
                    currentBooks.map(book => (
                      <BookCard to={`/book/${book._id}`} key={book._id}>
                        {book.coverImageUrl && <BookImage src={book.coverImageUrl} alt={book.title} />}
                        <h3>{book.title}</h3>
                        <p><strong>Autor:</strong> {book.author}</p>
                        <p><strong>Género:</strong> {book.genre || 'No especificado'}</p>
                        <p>
                          <strong>Precio:</strong> 
                          {book.price !== undefined ? `$${book.price.toFixed(2)}` : 'No especificado'}
                        </p>
                        <button 
                          onClick={(e) => {
                            e.preventDefault(); // Evita navegación al hacer clic en el botón
                            handleAddToCart(book);
                          }}
                        >
                          Añadir al carrito
                        </button>
                      </BookCard>
                    ))
                  ) : (
                    <p style={{ gridColumn: 'span 5', textAlign: 'center', padding: '2rem' }}>
                      No se encontraron libros con los criterios seleccionados.
                    </p>
                  )}
                </Grid>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <Pagination>
                    <PageButton onClick={prevPage} disabled={currentPage === 1}>
                      Anterior
                    </PageButton>

                    <PageInput 
                      type="number" 
                      min="1" 
                      max={totalPages} 
                      value={pageInput}
                      onChange={handlePageInputChange}
                      onKeyDown={handlePageInputSubmit}
                    />

                    <span>de {totalPages}</span>

                    <PageButton onClick={nextPage} disabled={currentPage === totalPages}>
                      Siguiente
                    </PageButton>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </CatalogLayout>
      </CatalogWrapper>
    </>
  );
};

export default BookCatalog;