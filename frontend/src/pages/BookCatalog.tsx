import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

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

const BookCatalog = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 20;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/books/books`)
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error('Error al cargar libros:', err));
  }, []);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <>
      <Header />
      <CatalogWrapper>
        <Grid>
          {currentBooks.map(book => (
            <BookCard to={`/book/${book._id}`} key={book._id}>
              {book.coverImageUrl && <BookImage src={book.coverImageUrl} alt={book.title} />}
              <h3>{book.title}</h3>
              <p><strong>Autor:</strong> {book.author}</p>
              <p><strong>Género:</strong> {book.genre}</p>
              <p><strong>Precio:</strong> ${book.price.toFixed(2)}</p>
            </BookCard>
          ))}
        </Grid>

        <Pagination>
          <PageButton onClick={prevPage} disabled={currentPage === 1}>
            Anterior
          </PageButton>
          <span>Página {currentPage} de {totalPages}</span>
          <PageButton onClick={nextPage} disabled={currentPage === totalPages}>
            Siguiente
          </PageButton>
        </Pagination>
      </CatalogWrapper>
    </>
  );
};

export default BookCatalog;
