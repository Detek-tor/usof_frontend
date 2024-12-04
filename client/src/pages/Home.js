// client/src/pages/Home.js

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [currentUserId, setCurrentUserId] = useState(null); // Добавлено состояние для ID текущего пользователя
  const [activeDropdown, setActiveDropdown] = useState(null); // Добавлено состояние
  const dropdownRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserRole(user.role);
      setCurrentUserId(user.id);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => { /*...*/ };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchHome = async () => { /*...*/ };
    fetchHome();
  }, [selectedCategories]);

  useEffect(() => {
    // Извлечение информации о текущем пользователе из localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserRole(user.role);
      setCurrentUserId(user.id);
    }
  }, []);

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

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            categories: selectedCategories.join(','),
          },
        };
        const response = await axios.get('/api/posts', config);
        const postsData = response.data;

        // Получение комментариев для каждого поста
        const postsWithComments = await Promise.all(
          postsData.map(async (post) => {
            try {
              const commentsResponse = await axios.get(`/api/comments/post/${post.id}`, config);
              return { ...post, comments: commentsResponse.data };
            } catch (error) {
              console.error(`Ошибка при загрузке комментариев для поста ${post.id}:`, error);
              return { ...post, comments: [] };
            }
          })
        );

        setPosts(postsWithComments);
        console.log('Полученные посты с комментариями:', postsWithComments);
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
        setMessage('Ошибка при загрузке данных.');
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchHome();
  }, [selectedCategories]);

  // Функция для применения фильтров
  const applyFilters = () => {
    setLoadingPosts(true);
    const fetchHome = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            categories: selectedCategories.join(','), // Передача выбранных категорий
          },
        };
        const response = await axios.get('/api/posts', config);
        const postsData = response.data;

        // Получение комментариев для каждого поста
        const postsWithComments = await Promise.all(
          postsData.map(async (post) => {
            try {
              const commentsResponse = await axios.get(`/api/comments/post/${post.id}`, config);
              return { ...post, comments: commentsResponse.data };
            } catch (error) {
              console.error(`Ошибка при загрузке комментариев для поста ${post.id}:`, error);
              return { ...post, comments: [] };
            }
          })
        );

        setPosts(postsWithComments);
        console.log('Полученные посты с комментариями:', postsWithComments);
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
        setMessage('Ошибка при загрузке данных.');
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchHome();
  };

  // Обработчик изменения выбора категорий
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

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', options);
  };

  // Обработчики лайков и дизлайков для постов
  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isAlreadyLiked = post.userLikeType === 'like';
    const isDisliked = post.userLikeType === 'dislike';

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (isAlreadyLiked) {
        // Удаление лайка
        await axios.delete('/api/likes', { data: { postId } }, config);
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === postId
              ? {
                  ...p,
                  likes_count: p.likes_count - 1,
                  userLikeType: null,
                }
              : p
          )
        );
      } else {
        // Добавление лайка
        await axios.post('/api/likes', { type: 'like', postId }, config);
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === postId
              ? {
                  ...p,
                  likes_count: p.likes_count + 1,
                  dislikes_count: isDisliked ? p.dislikes_count - 1 : p.dislikes_count,
                  userLikeType: 'like',
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Ошибка при обработке лайка:', error);
    }
  };

  const handleDislike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isAlreadyDisliked = post.userLikeType === 'dislike';
    const isLiked = post.userLikeType === 'like';

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (isAlreadyDisliked) {
        // Удаление дизлайка
        await axios.delete('/api/likes', { data: { postId } }, config);
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === postId
              ? {
                  ...p,
                  dislikes_count: p.dislikes_count - 1,
                  userLikeType: null,
                }
              : p
          )
        );
      } else {
        // Добавление дизлайка
        await axios.post('/api/likes', { type: 'dislike', postId }, config);
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === postId
              ? {
                  ...p,
                  dislikes_count: p.dislikes_count + 1,
                  likes_count: isLiked ? p.likes_count - 1 : p.likes_count,
                  userLikeType: 'dislike',
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Ошибка при обработке дизлайка:', error);
    }
  };

  // Обработчики лайков и дизлайков для комментариев
  const handleLikeComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post('/api/likes', { type: 'like', commentId, postId }, config);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id === commentId
                    ? { ...comment, likes_count: (comment.likes_count || 0) + 1, userLikeType: 'like' }
                    : comment
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error('Ошибка при добавлении лайка комментария:', error);
    }
  };

  const handleDislikeComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post('/api/likes', { type: 'dislike', commentId, postId }, config);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        dislikes_count: (comment.dislikes_count || 0) + 1,
                        likes_count: comment.userLikeType === 'like' ? comment.likes_count - 1 : comment.likes_count,
                        userLikeType: 'dislike',
                      }
                    : comment
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error('Ошибка при добавлении дизлайка комментария:', error);
    }
  };

  // Обработчик удаления поста
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/posts/${postId}`, config);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      console.log('Пост успешно удален.');
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
    }
  };

  // Обработчик изменения статуса поста
  const handleChangeStatus = async (postId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'not_active' : 'active';
    if (!window.confirm(`Вы уверены, что хотите изменить статус поста на "${newStatus}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(`/api/posts/${postId}/status`, { status: newStatus }, config);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, status: response.data.status }
            : post
        )
      );
      console.log('Статус поста успешно обновлен.');
    } catch (error) {
      console.error('Ошибка при обновлении статуса поста:', error);
    }
  };

  if (loadingPosts) {
    return <div className="loading">Загрузка...</div>;
  }

  const toggleDropdown = (postId) => {
    setActiveDropdown(activeDropdown === postId ? null : postId);
  };

  

  return (
    <div className="home-container">
      <h1>Главная Страница</h1>
      <p>{message}</p>

      <div className="category-filter">
        <label htmlFor="category-select">Фильтр по категориям:</label>
        <div className="filter-controls">
          <select 
            id="category-select" 
            multiple 
            value={selectedCategories}
            onChange={handleCategoryChange}
            className="category-select"
          >
            {categories.length > 0 ? (
              categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option disabled>Нет доступных категорий</option>
            )}
          </select>
          <button onClick={applyFilters} className="filter-button">
            Применить фильтры
          </button>
        </div>
      </div>

      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className="post-item">
            <div className="post-header">
              <Link to={`/posts/${post.id}`}>{post.title}</Link>
              <button className="dropdown-toggle" onClick={() => toggleDropdown(post.id)}>
                &#x22EE;
              </button>
              {activeDropdown === post.id && (
                <div className={`dropdown-menu ${activeDropdown === post.id ? 'active' : ''}`}>
                  {post.user_id === currentUserId && (
                    <Link to={`/posts/${post.id}/edit`} className="dropdown-item">Редактировать</Link>
                  )}
                  {userRole === 'admin' && (
                    <>
                      <button onClick={() => handleDeletePost(post.id)} className="dropdown-item">Удалить</button>
                      <button onClick={() => handleChangeStatus(post.id, post.status)} className="dropdown-item">
                        {post.status === 'active' ? 'Сделать неактивным' : 'Сделать активным'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <p>{post.content}</p>
            <div className="post-meta">
              <small>Автор: {post.username}</small>
              <small>Дата публикации: {formatDate(post.publish_date)}</small>
            </div>
            <div className="categories">
              {post.categories.map(category => (
                <span key={category.id} className="category-badge">
                  {category.name}
                </span>
              ))}
            </div>
            <div className="post-actions">
              <button
                className={`like-button ${post.userLikeType === 'like' ? 'active' : ''}`}
                onClick={() => handleLike(post.id)}
              >
                👍 {post.likes_count}
              </button>
              <button
                className={`dislike-button ${post.userLikeType === 'dislike' ? 'active' : ''}`}
                onClick={() => handleDislike(post.id)}
              >
                👎 {post.dislikes_count}
              </button>
              {/* Удалены прямые кнопки редактирования и удаления */}
            </div>

            {/* Раздел комментариев */}
            <div className="comments-section">
              <h4>Комментарии</h4>
              {post.comments && post.comments.length > 0 ? (
                post.comments.sort((a, b) => b.likes_count - a.likes_count).map(comment => (
                  <div key={comment.id} className="comment-item">
                    <p>{comment.content}</p>
                    <small>Автор: {comment.username}</small>
                    <div className="comment-likes-dislikes">
                      <span
                        className={`like-button ${comment.userLikeType === 'like' ? 'active' : ''}`}
                        onClick={() => handleLikeComment(post.id, comment.id)}
                      >
                        👍 {comment.likes_count || 0}
                      </span>
                      <span
                        className={`dislike-button ${comment.userLikeType === 'dislike' ? 'active' : ''}`}
                        onClick={() => handleDislikeComment(post.id, comment.id)}
                      >
                        👎 {comment.dislikes_count || 0}
                      </span>
                      {userRole === 'admin' && (
                        <button onClick={() => handleDeleteComment(post.id, comment.id)} className="admin-button delete-button">
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>Нет комментариев.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Обработчик удаления комментария
  async function handleDeleteComment(postId, commentId) {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/comments/${commentId}`, config);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter(comment => comment.id !== commentId),
              }
            : post
        )
      );
      console.log('Комментарий успешно удален.');
    } catch (error) {
      console.error('Ошибка при удалении комментария:', error);
    }
  }
};

export default Home;