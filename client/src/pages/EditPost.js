// client/src/pages/EditPost.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditPost.css';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPostAndCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                // Получение данных поста
                const postResponse = await axios.get(`/api/posts/${id}`, config);
                const post = postResponse.data;
                setTitle(post.title);
                setContent(post.content);
                setSelectedCategories(post.categories.map(cat => cat.id));

                // Получение всех категорий
                const categoriesResponse = await axios.get('/api/categories');
                setCategories(categoriesResponse.data);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке данных.');
            }
        };

        fetchPostAndCategories();
    }, [id]);

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
            const response = await axios.patch(
                `/api/posts/${id}`,
                { title, content, categoryIds: selectedCategories },
                config
            );
            setMessage('Пост успешно обновлён.');
            // Перенаправление на страницу поста после обновления
            navigate(`/posts/${response.data.id}`);
        } catch (err) {
            console.error('Ошибка при обновлении поста:', err);
            setError(err.response?.data?.message || 'Ошибка при обновлении поста');
        }
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="edit-post-container">
            <h2>Редактировать Пост</h2>
            {message && <p className="success-message">{message}</p>}
            <form onSubmit={handleSubmit} className="edit-post-form">
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
                <button type="submit" className="submit-button">
                    Обновить Пост
                </button>
            </form>
        </div>
    );
};

export default EditPost;