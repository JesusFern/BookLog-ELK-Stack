import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #ffffffcc;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s ease;
  &:hover {
    background-color: #fff;
    transform: scale(1.05);
  }
`;

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Title>Bienvenido a BookLog 📚</Title>
      <ButtonGroup>
        <Button onClick={() => navigate('/login')}>Iniciar Sesión</Button>
        <Button onClick={() => navigate('/register')}>Registrarse</Button>
      </ButtonGroup>
    </Container>
  );
};

export default Home;
