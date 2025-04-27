import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrapper, Title, Button } from './AuthFormWrapper';
import { API_BASE_URL } from '../config';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalBooks, setTotalBooks] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No autorizado.');
      navigate('/login');
      return;
    }

      fetch(`${API_BASE_URL}/api/books/total-books`)
        .then(res => res.json())
        .then(data => setTotalBooks(data.totalBooks))
        .catch(err => console.error('Error al cargar el número de libros:', err));
  
      fetch(`${API_BASE_URL}/api/users/total-users`)
        .then(res => res.json())
        .then(data => setTotalUsers(data.totalUsers))
        .catch(err => console.error('Error al cargar el número de usuarios:', err));
    }, []);

  const populateUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No autorizado.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/populate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shouldDelete: true }),
      });

      if (!response.ok) {
        throw new Error('Error al poblar usuarios');
      }

      const data = await response.json();
      console.log('✅ Usuarios poblados:', data);
      alert('Usuarios creados correctamente.');
    } catch (err: any) {
      console.error('❌ Error poblando usuarios:', err.message);
      alert('Error al poblar usuarios.');
    }
  };

  const importBooks = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No autorizado.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/import-books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shouldDelete: true }),
      });

      if (!response.ok) {
        throw new Error('Error al importar libros');
      }

      const data = await response.json();
      console.log('✅ Libros importados:', data);
      alert('Libros importados correctamente.');
    } catch (err: any) {
      console.error('❌ Error importando libros:', err.message);
      alert('Error al importar libros.');
    }
  };


  const syncBooksElasticMongoDB = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No autorizado.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/elastic-books/sync-elastic-books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al sincronizar libros con ElasticSearch');
      }

      const data = await response.json();
      console.log('✅ Libros sincronizados:', data);
      alert('Libros sincronizados correctamente.');
    } catch (err: any) {
      console.error('❌ Error sincronizando libros:', err.message);
      alert('Error al sincronizar libros.');
    }
  }


  const syncUsersElasticMongoDB = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No autorizado.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/elastic-books/sync-elastic-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al sincronizar usuarios con ElasticSearch');
      }

      const data = await response.json();
      console.log('✅ Usuarios sincronizados:', data);
      alert('Usuarios sincronizados correctamente.');
    } catch (err: any) {
      console.error('❌ Error sincronizando usuarios:', err.message);
      alert('Error al sincronizar usuarios.');
    }
  }

  const simulateBuy = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No autorizado.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/simulate-buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al simular compra');
      }

      const data = await response.json();
      console.log('✅ Compra simulada:', data);
      alert('Compra simulada correctamente.');
    } catch (err: any) {
      console.error('❌ Error simulando compre:', err.message);
      alert('Error al simular la compra.');
    }
  }

  return (
    <Wrapper>
      <Title>Panel de Administrador</Title>
{/*
      <Button onClick={populateUsers} style={{ marginBottom: '10px' }}>
        Poblar Usuarios
      </Button>
*/}
      <Button onClick={importBooks} style={{ marginBottom: '10px' }}>
        Importar Libros
      </Button>

      <Button onClick={syncBooksElasticMongoDB} style={{ marginBottom: '10px' }}>
        Sincronizar Libros en Elastic con MongoDB
      </Button>

      <Button onClick={syncUsersElasticMongoDB} style={{ marginBottom: '10px' }}>
        Sincronizar Usuarios en Elastic con MongoDB
      </Button>

      <Button onClick={simulateBuy} style={{ marginBottom: '10px' }}>
        Simular Compra de Libros Aleatorios
      </Button>

      <Button onClick={() => navigate('/catalog')}>
        Ir al Catálogo
      </Button>

      <div style={{ height: '2rem' }} />

      <div style={{
        padding: '1rem',
        marginBottom: '2rem',
        border: '1px solid #ccc',
        borderRadius: '12px',
        backgroundColor: '#f9f9f9',
        textAlign: 'center'
      }}>
        <h3>📊 Estadísticas MongoDB</h3>
        <p><strong>Usuarios:</strong> {totalUsers}</p>
        <p><strong>Libros:</strong> {totalBooks}</p>
      </div>
    </Wrapper>
  );
};

export default AdminDashboard;
