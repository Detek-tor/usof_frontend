// client/src/pages/EditProfile.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    full_name: '',
    email: '',
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
        const response = await axios.get('/api/users/me', config);
        setUser({
          username: response.data.username,
          full_name: response.data.full_name,
          email: response.data.email,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка при загрузке данных пользователя');
      }
    };

    fetchUser();
  }, []);

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

    // Проверка на заполнение всех обязательных полей
    if (!user.username || !user.full_name || !user.email) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Обновление данных профиля
      const profileConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const profileData = {
        username: user.username,
        full_name: user.full_name,
        email: user.email,
      };
      await axios.patch('/api/users/profile', profileData, profileConfig);
      setMessage('Данные профиля успешно обновлены.');

      // Обновление аватара, если выбран
      if (avatar) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatar);

        const avatarConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        };

        await axios.patch('/api/users/avatar', avatarFormData, avatarConfig);
        setMessage(prev => prev + ' Аватар успешно обновлён.');
      }

      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении данных');
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="edit-profile-container">
      <h2>Редактировать Профиль</h2>
      {message && <p className="success-message">{message}</p>}
      <form onSubmit={handleSubmit} className="edit-profile-form">
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
          <label htmlFor="avatar">Аватар:</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        <button type="submit" className="submit-button">Сохранить Изменения</button>
      </form>
    </div>
  );
};

export default EditProfile;