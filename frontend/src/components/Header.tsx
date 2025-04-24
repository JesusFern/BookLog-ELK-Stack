import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, ShoppingCart, User, Home } from 'lucide-react';

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #333;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  display: flex;
  align-items: center;
`;

const BackButton = styled(IconButton)`
  padding: 0.5rem;
  border-radius: 50%;
`;

const Header = () => {
  const navigate = useNavigate();

  return (
    <HeaderWrapper>
      <LeftSection>
        {/* Botón de casita para volver al catálogo */}
        <IconButton title="Volver al Catálogo" onClick={() => navigate('/catalog')}>
          <Home />
        </IconButton>
        
        {/* Botón de "Volver" */}
        <BackButton title="Volver" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </BackButton>
      </LeftSection>
      
      <RightSection>
        <IconButton title="Carrito" onClick={() => navigate('/cart')}>
          <ShoppingCart />
        </IconButton>
        <IconButton title="Perfil de Usuario" onClick={() => navigate('/user')}>
          <User />
        </IconButton>
      </RightSection>
    </HeaderWrapper>
  );
};

export default Header;
