import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

interface PopularBook {
  _id: string;
  title: string;
  author: string;
  price: number;
  coverImageUrl?: string;
  purchasedCount: number;
}

interface PopularBooksProps {
  onAddToCart: (bookId: string) => Promise<void>;
}

const PopularBooksContainer = styled.div`
  margin-bottom: 2rem;
`;

const PopularBooksTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  
  &::before {
    content: '🔥';
    margin-right: 8px;
  }
`;

const PopularBooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
  
  h3 {
    margin: 0.3rem 0 0.2rem 0;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  p {
    margin: 0.1rem 0;
    line-height: 1.2;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const BookImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 6px;
`;

const PopularBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff9800;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  
  &::before {
    content: '👑';
    margin-right: 4px;
  }
`;

const AddToCartButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem;
  font-size: 0.85rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: auto;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  
  &::after {
    content: '';
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PopularBooks: React.FC<PopularBooksProps> = ({ onAddToCart }) => {
  const [popularBooks, setPopularBooks] = useState<PopularBook[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/books/top-books`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setPopularBooks(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching popular books:', err);
        setError('No se pudieron cargar los libros populares');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularBooks();
  }, []);

  // Si hay un error o no hay libros populares, no renderizar el componente
  if (error || (popularBooks.length === 0 && !isLoading)) {
    return null;
  }

  return (
    <PopularBooksContainer>
      <PopularBooksTitle>Libros Populares</PopularBooksTitle>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <PopularBooksGrid>
          {popularBooks.map((book, index) => (
            <BookCard to={`/book/${book._id}`} key={book._id}>
              {book.coverImageUrl && (
                <BookImage src={book.coverImageUrl} alt={book.title} />
              )}
              <PopularBadge>#{index + 1}</PopularBadge>
              <h3 title={book.title}>{book.title}</h3>
              <p><strong>Autor:</strong> {book.author}</p>
              <p>
                <strong>Precio:</strong> 
                {book.price !== undefined ? `$${book.price.toFixed(2)}` : 'No especificado'}
              </p>
              <p><strong>Vendidos:</strong> {book.purchasedCount || 0}</p>
              <AddToCartButton 
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(book._id);
                }}
              >
                Añadir al carrito
              </AddToCartButton>
            </BookCard>
          ))}
        </PopularBooksGrid>
      )}
    </PopularBooksContainer>
  );
};

export default PopularBooks;