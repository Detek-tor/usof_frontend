// client/src/pages/ResetPassword.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!token) {
    return <div className="error-message">Токен сброса пароля отсутствует.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    try {
      await axios.post('/api/users/reset-password', { token, newPassword });
      setMessage('Пароль успешно сброшен. Вы можете войти с новым паролем.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при сбросе пароля.');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Сброс пароля</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="reset-password-form">
        <div className="form-group">
          <label htmlFor="newPassword">Новый пароль:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Введите новый пароль"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Подтвердите пароль:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Подтвердите новый пароль"
          />
        </div>
        <button type="submit" className="submit-button">Сбросить пароль</button>
      </form>
    </div>
  );
};

export default ResetPassword;