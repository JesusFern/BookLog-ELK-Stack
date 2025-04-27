import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import styled from 'styled-components';

const SummaryWrapper = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const BookCard = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #fff;
`;

const BookImage = styled.img`
  width: 100px;
  height: 150px;
  object-fit: cover;
  margin-right: 1rem;
  border-radius: 4px;
`;

const BookInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const BookTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const DownloadLinks = styled.ul`
  margin-top: 0.5rem;
  list-style-type: none;
  padding: 0;

  li {
    margin-bottom: 0.5rem;
  }
  
  a {
    color: #007bff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PurchaseSummary = () => {
  const location = useLocation();
  const { purchaseData } = location.state || {}; // Obtenemos los datos de compra pasados por el `Link`
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    if (purchaseData?.purchasedBooks) {
      setBooks(purchaseData.purchasedBooks); // Guardamos los libros de la compra en el estado
    }
  }, [purchaseData]);

  return (
    <>
      <Header />
      <SummaryWrapper>
        <h2>Resumen de Compra</h2>
        {purchaseData ? (
          <>
            <p>¡Gracias por tu compra!</p>
            <p><strong>Libros comprados:</strong></p>
            <div>
              {books.length > 0 ? (
                books.map((book: any) => (
                  <BookCard key={book._id}>
                    <BookImage src={book.coverImageUrl} alt={book.title} />
                    <BookInfo>
                      <BookTitle>{book.title}</BookTitle>
                      <p>Formatos disponibles para descargar:</p>
                      <DownloadLinks>
                        {book.downloadFileUrls &&
                          Object.entries(book.downloadFileUrls).map(
                            ([format, url]) => (
                              typeof url === 'string' && url.trim() !== '' ? (
                                <li key={format}>
                                  <a href={url} target="_blank" rel="noopener noreferrer">
                                    Descargar {format}
                                  </a>
                                </li>
                              ) : null
                            )
                          )}
                      </DownloadLinks>
                    </BookInfo>
                  </BookCard>
                ))
              ) : (
                <p>No hay libros disponibles en esta compra.</p>
              )}
            </div>
            <div style={{ marginTop: '2rem' }}>
              <Link to="/catalog">
                <button
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Volver al Catálogo
                </button>
              </Link>
            </div>
          </>
        ) : (
          <p>No hay información de la compra.</p>
        )}
      </SummaryWrapper>
    </>
  );
};

export default PurchaseSummary;
