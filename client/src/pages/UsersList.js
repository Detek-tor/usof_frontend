// client/src/pages/UsersList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './UsersList.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get('/api/users', config);
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/users/${userId}`, config);
      setUsers(users.filter(user => user.id !== userId));
      console.log('Пользователь успешно удалён.');
    } catch (err) {
      console.error('Ошибка при удалении пользователя:', err);
      alert(err.response?.data?.message || 'Ошибка при удалении пользователя');
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="users-list-container">
      <h2>Список Пользователей</h2>
      {users.length > 0 ? (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Аватар</th>
              <th>Имя Пользователя</th>
              <th>Полное Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Подтвержден</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  <img
                    src={`/${user.avatar}`} // Убедитесь, что путь правильный
                    alt="Аватар"
                    className="avatar"
                  />
                </td>
                <td>{user.username}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.is_confirmed ? 'Да' : 'Нет'}</td>
                <td>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="admin-button delete-button"
                  >
                    Удалить
                  </button>
                  <Link to={`/users/${user.id}/edit`} className="admin-button edit-button">
                    Редактировать
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Пользователи отсутствуют.</p>
      )}
    </div>
  );
};

export default UsersList;