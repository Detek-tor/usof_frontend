// client/src/components/Header.js

import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../contexts/ThemeContext';
import './Header.css';

const Header = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const response = await axios.get('/api/users/me', config);
          setUser(response.data);
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Удаляем данные пользователя
    window.location.href = '/login';
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Usof</Link>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/">Главная</Link>
          </li>
          {isAuthenticated ? (
            <>
              {/* Кнопка создания поста для всех пользователей */}
              <li>
                <Link to="/create-post" className="admin-button">
                  Создать Пост
                </Link>
              </li>

              {/* Кнопка создания категории только для администраторов */}
              {user && user.role === 'admin' && (
                <li>
                  <Link to="/create-category" className="admin-button">
                    Создать Категорию
                  </Link>
                </li>
              )}
              {user && user.role === 'admin' && (
                <li>
                  <Link to="/users" className="admin-button">
                    Список Пользователей
                  </Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="logout-button">
                  Выйти
                </button>
              </li>
              {user && (
                <li className="avatar-container">
                  <Link to="/profile">
                    <img
                      src={`/${user.avatar}`}
                      alt="Аватар"
                      className="avatar"
                    />
                  </Link>
                </li>
              )}
              <li>
                <button onClick={toggleTheme} className="theme-toggle-button">
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Вход</Link>
              </li>
              <li>
                <Link to="/register">Регистрация</Link>
              </li>
              <li>
                <button onClick={toggleTheme} className="theme-toggle-button">
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;