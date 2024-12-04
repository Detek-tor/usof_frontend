import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        setUser(response.data);
      } catch (err) {
        setError('Не удалось загрузить данные пользователя.');
      }
    };

    fetchUser();
  }, []);

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post('/api/users/request-password-change', { email: user.email }, config);
      setSuccess('На ваш email отправлено письмо для сброса пароля.');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при запросе сброса пароля.');
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!user) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="profile-container">
      <h2>Личный Кабинет</h2>
      <img src={`/${user.avatar}`} alt="Аватар" className="profile-avatar" />
      <p><strong>Имя пользователя:</strong> {user.username}</p>
      <p><strong>Полное имя:</strong> {user.full_name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Роль:</strong> {user.role}</p>
      {/* Добавьте другие данные по необходимости */}
      <Link to="/profile/edit" className="edit-button">Редактировать данные</Link>
      <button onClick={handleChangePassword} className="change-password-button">Изменить пароль</button>
      {success && <p className="success-message">{success}</p>}
    </div>
  );
};

export default Profile;