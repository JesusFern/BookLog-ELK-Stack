import styled from 'styled-components';
import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const ProfileWrapper = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #e74c3c;  // Rojo brillante
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s ease;
  
  &:hover {
    background-color: #c0392b;  // Rojo más oscuro cuando se pasa el ratón
    transform: scale(1.05);
  }
`;

const UserProfile = () => {
  const navigate = useNavigate();  
  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/api/users/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            if (data.user.purchasedBooks && data.user.purchasedBooks.length > 0) {
              Promise.all(
                data.user.purchasedBooks.map((bookId: string) =>
                  fetch(`${API_BASE_URL}/api/books/${bookId}`)
                    .then(res => res.json())
                    .then(book => book)
                )
              ).then(fetchedBooks => {
                setBooks(fetchedBooks);  
                setLoading(false);  
              })
              .catch(err => {
                console.error('Error al cargar los libros:', err);
                setLoading(false);
              });
            } else {
              setLoading(false);  
            }
          } else {
            console.error('No se encontró el usuario');
            setLoading(false);  
          }
        })
        .catch(err => {
          console.error('Error al cargar el perfil:', err);
          setLoading(false);  
        });
    } else {
      setLoading(false);
      alert('No autorizado.');
      navigate('/login');
      return;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');  
    navigate('/login');  
  };

  return (
    <>
      <Header />
      <ProfileWrapper>
        <h2>Perfil de Usuario</h2>
        {loading ? (
          <p>Cargando información del usuario...</p>  
        ) : user ? (
          <UserInfo>
            <p><strong>Nombre de usuario: </strong>{user.name}</p>
            <p><strong>Correo electrónico: </strong>{user.email}</p>
            <p><strong>Fecha de registro: </strong>{new Date(user.createdAt).toLocaleDateString()}</p>
            <p>
              <strong>Libros comprados: </strong>
              {books.length > 0 ? (
                <ul>
                  {books.map((book: any, index: number) => (
                    <li key={index}>
                      {book.title}
                    </li>
                  ))}
                </ul>
              ) : (
                'No ha comprado libros.'
              )}
            </p>
            <Button onClick={handleLogout}>Cerrar sesión</Button>
          </UserInfo>
        ) : (
          <p>No se encontró el usuario.</p>  
        )}
      </ProfileWrapper>
    </>
  );
};

export default UserProfile;
