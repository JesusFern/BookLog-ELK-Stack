import styled from 'styled-components';

export const Wrapper = styled.div`
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
`;

export const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

export const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #fda085;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #fc7b54;
  }
`;
