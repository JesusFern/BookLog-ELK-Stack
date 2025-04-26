// src/pages/BookDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';
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

const RelatedBooksWrapper = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
`;

const BookItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const BookImage = styled.img`
  width: 80px;
  height: 120px;
  object-fit: cover;
  margin-right: 1rem;
`;

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]); // Estado para libros relacionados

  useEffect(() => {
    // Obtener detalles del libro
    fetch(`${API_BASE_URL}/api/books/${id}`)
      .then(res => res.json())
      .then(data => setBook(data))
      .catch(err => console.error('Error al cargar el libro:', err));

    // Obtener libros relacionados
    fetch(`${API_BASE_URL}/api/books/related/${id}`)
      .then(res => res.json())
      .then(data => setRelatedBooks(data))
      .catch(err => console.error('Error al cargar libros relacionados:', err));
  }, [id]);

  const handleAddToCart = async (book: Book) => {
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
        body: JSON.stringify({ bookId: book._id }),
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
        <button onClick={() => handleAddToCart(book)}>Añadir al carrito</button>
      </DetailWrapper>

      {/* Sección de libros relacionados */}
      {relatedBooks.length > 0 && (
        <RelatedBooksWrapper>
          <h3>Libros similares</h3>
          {relatedBooks.map((relatedBook) => (
            <BookItem key={relatedBook._id}>
              {relatedBook.coverImageUrl && (
                <BookImage src={relatedBook.coverImageUrl} alt={relatedBook.title} />
              )}
              <div>
                <h4>{relatedBook.title}</h4>
                <p><strong>Autor: </strong>{relatedBook.author}</p>
                <p><strong>Precio: </strong>${relatedBook.price.toFixed(2)}</p>
              </div>
            </BookItem>
          ))}
        </RelatedBooksWrapper>
      )}
    </>
  );
};

export default BookDetail;
