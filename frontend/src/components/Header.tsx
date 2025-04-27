import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ShoppingCart, User, Home, Shield } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

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

// Tipar el payload del token
interface JwtPayload {
  userId: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

const Header: React.FC = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  let isAdmin = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      isAdmin = decoded.isAdmin;
    } catch (err) {
      console.error('❌ Error decodificando token:', err);
    }
  }

  return (
    <HeaderWrapper>
      <LeftSection>
        <IconButton title="Volver al Catálogo" onClick={() => navigate('/catalog')}>
          <Home />
        </IconButton>
      </LeftSection>
      
      <RightSection>
        {isAdmin && (
          <IconButton title="Panel Admin" onClick={() => navigate('/admin')}>
            <Shield />
          </IconButton>
        )}
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
