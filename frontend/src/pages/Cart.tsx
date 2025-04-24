// src/pages/Cart.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';

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
  // Suponiendo que los libros en el carrito están en el estado local
  const [cartItems, setCartItems] = useState([
    {
      _id: '1',
      title: 'Libro 1',
      author: 'Autor 1',
      price: 20,
      coverImageUrl: 'https://via.placeholder.com/100x150',
    },
    {
      _id: '2',
      title: 'Libro 2',
      author: 'Autor 2',
      price: 15,
      coverImageUrl: 'https://via.placeholder.com/100x150',
    },
  ]);

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
                <p>Autor: {item.author}</p>
                <p>Precio: ${item.price}</p>
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
