// src/pages/Cart.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import { API_BASE_URL } from '../config';

const CartWrapper = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const CartItemImage = styled.img`
  width: 100px;
  height: 150px;
  object-fit: cover;
  margin-right: 1rem;
`;

const CartDetails = styled.div`
  display: flex;
  flex-direction: column;

  p {
    margin: 0.3rem 0; /* Reduce el espacio vertical */
    line-height: 1.2;
  }
`;

const CartButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
`;

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/api/users/cart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.cart) {
            setCartItems(data.cart);
            console.log('🛒 Carrito:', data.cart);
          } else {
            console.error('No se encontró el usuario');
          }
        })
        .catch(err => {
          console.error('Error al cargar el carrito:', err);
        });
    }
  }, []);

  return (
    <>
        <Header />
        <CartWrapper>
        <h2>Tu Carrito de Compras</h2>
        {cartItems.length === 0 ? (
            <p>No tienes libros en el carrito.</p>
        ) : (
            cartItems.map(item => (
            <CartItem key={item._id}>
                <CartItemImage src={item.coverImageUrl} alt={item.title} />
                <CartDetails>
                <h3>{item.title}</h3>
                <p><strong>Autor:</strong> {item.author}</p>
                <p><strong>Precio:</strong> ${item.price.toFixed(2)}</p>
                <p><strong>Formatos disponibles:</strong> {item.format.join(', ')}</p>
                </CartDetails>
            </CartItem>
            ))
        )}
        <CartButton onClick={() => alert('Procesar pago')}>Ir a pagar</CartButton>
        </CartWrapper>
    </>
  );
};

export default Cart;
