// src/pages/BookDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';
import Header from '../components/Header';

const DetailWrapper = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
`;

const CoverImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  margin-bottom: 1rem;
`;

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/books/${id}`)
      .then(res => res.json())
      .then(data => setBook(data))
      .catch(err => console.error('Error al cargar el libro:', err));
  }, [id]);

  if (!book) return <p style={{ textAlign: 'center' }}>Cargando...</p>;

  return (
    <>
      <Header />
      <DetailWrapper>
        {book.coverImageUrl && <CoverImage src={book.coverImageUrl} alt={book.title} />}
        <h2>{book.title}</h2>
        <p><strong>Autor:</strong> {book.author}</p>
        <p><strong>Género:</strong> {book.genre}</p>
        <p><strong>Idioma:</strong> {book.language}</p>
        <p><strong>Año de publicación:</strong> {book.publishedYear}</p>
        <p><strong>Número de páginas:</strong> {book.numPages}</p>
        <p><strong>Precio:</strong> ${book.price.toFixed(2)}</p>
        <p><strong>Resumen:</strong> {book.summary || 'No disponible'}</p>
        <p><strong>Formatos disponibles:</strong> {book.format.join(', ')}</p>
      </DetailWrapper>
    </>
  );
};

export default BookDetail;
