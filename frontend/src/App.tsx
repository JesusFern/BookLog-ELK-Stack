// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import BookCatalog from './pages/BookCatalog';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import PurchaseSummary from './pages/PurchaseSummary';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/catalog" element={<BookCatalog />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/user" element={<UserProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path='/purchase-summary' element={<PurchaseSummary />} />
      </Routes>
    </Router>
  );
}

export default App;
