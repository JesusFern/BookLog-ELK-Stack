import React, { useState } from 'react';
import { Wrapper, Title, Input, Button } from './AuthFormWrapper';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log(data);

    // Redirigir si el login fue exitoso
    if (response.ok) {
      navigate('/catalog');
    }
  };

  return (
    <Wrapper>
      <Title>Iniciar Sesión</Title>
      <Input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} />
      <Input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
      <Button onClick={handleLogin}>Entrar</Button>
    </Wrapper>
  );
};

export default LoginForm;
