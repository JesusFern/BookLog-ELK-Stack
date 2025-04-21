import React, { useState } from 'react';
import { Wrapper, Title, Input, Button } from './AuthFormWrapper';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    console.log(data);

    if (response.ok) {
      navigate('/catalog');
    }
  };

  return (
    <Wrapper>
      <Title>Registrarse</Title>
      <Input type="text" placeholder="Nombre de usuario" value={name} onChange={e => setName(e.target.value)} />
      <Input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} />
      <Input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
      <Button onClick={handleRegister}>Crear cuenta</Button>
    </Wrapper>
  );
};

export default RegisterForm;
