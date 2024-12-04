// client/src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ResetPassword from './pages/ResetPassword';
import CreatePost from './pages/CreatePost';
import CreateCategory from './pages/CreateCategory';
import UsersList from './pages/UsersList';
import EditUser from './pages/EditUser';
import EditPost from './pages/EditPost';
import { ThemeProvider } from './contexts/ThemeContext';
import PostDetail from './pages/PostDetail'; // Импортируйте компонент PostDetail
import './App.css';

const App = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <ThemeProvider value={{ theme, toggleTheme }}>
      <Router>
        <Header handleLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} /> {/* Добавлено */}
          <Route path="/posts/:id/edit" element={<EditPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/create-category" element={<CreateCategory />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/:userId/edit" element={<EditUser />} />
          {/* Добавьте остальные маршруты по необходимости */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;