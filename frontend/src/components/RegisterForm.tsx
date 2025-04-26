import React, { useState } from 'react';
import { Wrapper, Title, Input, Button } from './AuthFormWrapper';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleRegister = async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, isAdmin }),
    });
    const data = await response.json();
    console.log(data);

    if (response.ok) {
      navigate('/login');
    }
  };

  return (
    <Wrapper>
      <Title>Registrarse</Title>
      <Input type="text" placeholder="Nombre de usuario" value={name} onChange={e => setName(e.target.value)} />
      <Input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} />
      <Input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
      
      <div style={{ marginTop: '15px', marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={e => setIsAdmin(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Registrar como administrador
        </label>
      </div>

      <Button onClick={handleRegister}>Crear cuenta</Button>
    </Wrapper>
  );
};

export default RegisterForm;
