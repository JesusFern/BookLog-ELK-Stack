import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrapper, Title, Button } from './AuthFormWrapper';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
  const navigate = useNavigate();

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

      <Button onClick={() => navigate('/catalog')}>
        Ir al Catálogo
      </Button>
    </Wrapper>
  );
};

export default AdminDashboard;
