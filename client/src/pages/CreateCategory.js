// client/src/pages/CreateCategory.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateCategory.css';

const CreateCategory = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        '/api/categories',
        { name, description },
        config
      );
      setMessage('Категория успешно создана.');
      // Перенаправление на список категорий или другую страницу
      navigate('/categories');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании категории');
    }
  };

  return (
    <div className="create-category-container">
      <h2>Создать Категорию</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="create-category-form">
        <div className="form-group">
          <label htmlFor="name">Название Категории:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Введите название категории"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Введите описание категории"
          ></textarea>
        </div>
        <button type="submit" className="submit-button">
          Создать
        </button>
      </form>
    </div>
  );
};

export default CreateCategory;