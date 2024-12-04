// client/src/pages/EditUser.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditUser.css';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    full_name: '',
    email: '',
    role: 'user',
  });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(`/api/users/${userId}`, config);
        setUser({
          username: response.data.username,
          full_name: response.data.full_name,
          email: response.data.email,
          role: response.data.role,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка при загрузке данных пользователя');
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('full_name', user.full_name);
    formData.append('email', user.email);
    formData.append('role', user.role);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };
      await axios.patch(`/api/users/${userId}`, formData, config);
      setMessage('Пользователь успешно обновлён.');
      // Перенаправление на список пользователей после обновления
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении пользователя');
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="edit-user-container">
      <h2>Редактирование Пользователя</h2>
      {message && <p className="success-message">{message}</p>}
      <form onSubmit={handleSubmit} className="edit-user-form">
        <div className="form-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
            placeholder="Введите имя пользователя"
          />
        </div>
        <div className="form-group">
          <label htmlFor="full_name">Полное имя:</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={user.full_name}
            onChange={handleChange}
            required
            placeholder="Введите полное имя"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
            placeholder="Введите email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Роль:</label>
          <select
            id="role"
            name="role"
            value={user.role}
            onChange={handleChange}
            required
          >
            <option value="user">Пользователь</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="avatar">Аватар:</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        <button type="submit" className="submit-button">Обновить</button>
      </form>
    </div>
  );
};

export default EditUser;