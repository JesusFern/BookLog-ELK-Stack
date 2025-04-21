import React from 'react';
import styled from 'styled-components';

const CatalogWrapper = styled.div`
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: 100vh;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
`;

const BookCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
`;

const BookCatalog = () => {
  // Puedes reemplazar este array con una consulta real más adelante
  const books = [
    { id: 1, title: "El Principito", author: "Antoine de Saint-Exupéry" },
    { id: 2, title: "Cien Años de Soledad", author: "Gabriel García Márquez" },
    { id: 3, title: "Don Quijote de la Mancha", author: "Miguel de Cervantes" },
  ];

  return (
    <CatalogWrapper>
      <Title>📚 Catálogo de Libros</Title>
      {books.map(book => (
        <BookCard key={book.id}>
          <h2>{book.title}</h2>
          <p>Autor: {book.author}</p>
        </BookCard>
      ))}
    </CatalogWrapper>
  );
};

export default BookCatalog;
