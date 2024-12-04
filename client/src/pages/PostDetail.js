// client/src/pages/PostDetail.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [userRole, setUserRole] = useState('user'); // Добавлено состояние для роли пользователя

  useEffect(() => {
    const fetchUserRole = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.role) {
        setUserRole(user.role);
      } else {
        // Если пользователь не найден, перенаправляем на страницу входа
        window.location.href = '/login';
      }
    };
  
    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Пожалуйста, войдите в систему для просмотра поста.');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(`/api/posts/${id}`, config);
        setPost(response.data);
        setLikesCount(response.data.likes_count);
        setDislikesCount(response.data.dislikes_count);
      } catch (error) {
        console.error('Ошибка при загрузке поста:', error);
        setError('Ошибка при загрузке данных.');
      }
    };

    const fetchComments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Пожалуйста, войдите в систему для просмотра комментариев.');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(`/api/comments/post/${id}`, config);
        setComments(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке комментариев:', error);
      }
    };

    fetchPost();
    fetchComments();
  }, [id]);

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', options);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!post) {
    return <div className="loading">Загрузка...</div>;
  }

  // Обработчики лайков и дизлайков для поста
  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post('/api/likes', { type: 'like', postId: id }, config);
      setLikesCount(likesCount + 1);
    } catch (error) {
      console.error('Ошибка при добавлении лайка:', error);
    }
  };

  const handleDislike = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post('/api/likes', { type: 'dislike', postId: id }, config);
      setDislikesCount(dislikesCount + 1);
    } catch (error) {
      console.error('Ошибка при добавлении дизлайка:', error);
    }
  };

  // Обработчики лайков и дизлайков для комментариев
  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post('/api/likes', { type: 'like', commentId }, config);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes_count: (comment.likes_count || 0) + 1 }
            : comment
        )
      );
    } catch (error) {
      console.error('Ошибка при добавлении лайка комментария:', error);
    }
  };

  const handleDislikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post('/api/likes', { type: 'dislike', commentId, postId: id }, config);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, dislikes_count: (comment.dislikes_count || 0) + 1 }
            : comment
        )
      );
    } catch (error) {
      console.error('Ошибка при добавлении дизлайка комментария:', error);
    }
  };

  // Обработчик добавления комментария
  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        '/api/comments',
        { content: newComment, postId: id },
        config
      );
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    }
  };

  // Обработчик удаления поста (для админов)
  const handleDeletePost = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/posts/${id}`, config);
      // Перенаправление или обновление состояния после удаления
      window.location.href = '/';
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
    }
  };

  // Обработчик изменения статуса поста (для админов)
  const handleChangeStatus = async () => {
    const newStatus = post.status === 'active' ? 'not_active' : 'active';
    if (!window.confirm(`Вы уверены, что хотите изменить статус поста на "${newStatus}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(`/api/posts/${id}/status`, { status: newStatus }, config);
      setPost({ ...post, status: response.data.status });
      console.log('Статус поста успешно обновлен.');
    } catch (error) {
      console.error('Ошибка при обновлении статуса поста:', error);
    }
  };

  // Обработчик удаления комментария (для админов)
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/comments/${commentId}`, config);
      setComments(comments.filter(comment => comment.id !== commentId));
      console.log('Комментарий успешно удален.');
    } catch (error) {
      console.error('Ошибка при удалении комментария:', error);
    }
  };

  return (
    <div className="post-detail-container">
      <h1>{post.title}</h1>
      <p className="publish-date">{formatDate(post.publish_date)}</p>
      <div className="categories">
        {post.categories && post.categories.length > 0 ? (
          post.categories.map((category) => (
            <span key={category.id} className="category-badge">
              {category.name}
            </span>
          ))
        ) : (
          <span>Без категории</span>
        )}
      </div>
      <p>{post.content}</p>
      <div className="likes-dislikes">
        <button
          className={`like-button ${post.userLikeType === 'like' ? 'active' : ''}`}
          onClick={handleLike}
        >
          👍 {likesCount}
        </button>
        <button
          className={`dislike-button ${post.userLikeType === 'dislike' ? 'active' : ''}`}
          onClick={handleDislike}
        >
          👎 {dislikesCount}
        </button>
        {userRole === 'admin' && (
          <>
            <button onClick={handleDeletePost} className="admin-button delete-button">
              Удалить Пост
            </button>
            <button onClick={handleChangeStatus} className="admin-button status-button">
              {post.status === 'active' ? 'Сделать неактивным' : 'Сделать активным'}
            </button>
          </>
        )}
      </div>
      <small>Автор: {post.username}</small>

      <div className="comments-section">
      <h4>Комментарии</h4>
        {post.comments && post.comments.length > 0 ? (
          post.comments.sort((a, b) => b.likes_count - a.likes_count).map(comment => (
            <div key={comment.id} className="comment-item">
              <p>{comment.content}</p>
              <small>Автор: {comment.username}</small>
              <div className="comment-likes-dislikes">
                <button
                  className={`like-button ${comment.userLikeType === 'like' ? 'active' : ''}`}
                  onClick={() => handleLikeComment(post.id, comment.id)}
                >
                  👍 {comment.likes_count || 0}
                </button>
                <button
                  className={`dislike-button ${comment.userLikeType === 'dislike' ? 'active' : ''}`}
                  onClick={() => handleDislikeComment(post.id, comment.id)}
                >
                  👎 {comment.dislikes_count || 0}
                </button>
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
        <form onSubmit={handleAddComment} className="comment-form">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            placeholder="Добавить комментарий..."
          />
          <button type="submit">Отправить</button>
        </form>
      </div>
    </div>
  );
};

export default PostDetail;