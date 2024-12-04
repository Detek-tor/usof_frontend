// client/src/pages/CreatePost.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreatePost.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Ошибка при получении категорий:', error);
      }
    };
  
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(parseInt(options[i].value));
      }
    }
    setSelectedCategories(selected);
  };

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
        '/api/posts',
        { title, content, categoryIds: selectedCategories },
        config
      );
      setMessage('Пост успешно создан.');
      // Перенаправление на страницу поста
      navigate(`/posts/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании поста');
    }
  };

  return (
    <div className="create-post-container">
      <h2>Создать Пост</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="title">Название Поста:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Введите название поста"
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Содержимое:</label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Введите содержимое поста"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="categories">Категории:</label>
          <select
            id="categories"
            name="categories"
            multiple
            value={selectedCategories}
            onChange={handleCategoryChange}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-button">
          Создать Пост
        </button>
      </form>
    </div>
  );
};

export default CreatePost;