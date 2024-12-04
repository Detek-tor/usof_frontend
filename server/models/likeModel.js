const pool = require('../config/db');
const userModel = require('./userModel');

class likeModel {
      async _updatePostLikeCounts(postId, commentId = null) {
        try {
            if (commentId !== null) {
                // Обновление счетчиков для комментария
                const counts = await pool.query(`
                    SELECT 
                        COUNT(*) FILTER (WHERE type = 'like') AS likes_count,
                        COUNT(*) FILTER (WHERE type = 'dislike') AS dislikes_count
                    FROM likes 
                    WHERE comment_id = $1
                `, [commentId]);

                const { likes_count, dislikes_count } = counts.rows[0];

                await pool.query(`
                    UPDATE comments 
                    SET likes_count = $1, dislikes_count = $2 
                    WHERE id = $3
                `, [likes_count || 0, dislikes_count || 0, commentId]);
            } else {
                // Обновление счетчиков для поста
                const counts = await pool.query(`
                    SELECT 
                        COUNT(*) FILTER (WHERE type = 'like') AS likes_count,
                        COUNT(*) FILTER (WHERE type = 'dislike') AS dislikes_count
                    FROM likes 
                    WHERE post_id = $1 AND comment_id IS NULL
                `, [postId]);

                const { likes_count, dislikes_count } = counts.rows[0];

                await pool.query(`
                    UPDATE posts 
                    SET likes_count = $1, dislikes_count = $2 
                    WHERE id = $3
                `, [likes_count || 0, dislikes_count || 0, postId]);
            }
        } catch (error) {
            console.error('Ошибка при обновлении счетчиков:', error);
            throw error;
        }
    }

    async addLike(postId, userId, type, commentId = null) {
      try {
          console.log(`Добавление ${type}: postId=${postId}, commentId=${commentId}, userId=${userId}`);

          let ownerId;
          if (commentId !== null) {
              const comment = await pool.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);
              ownerId = comment.rows[0]?.user_id;
              console.log(`Владелец комментария: ownerId=${ownerId}`);
          } else if (postId !== null) {
              const post = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
              ownerId = post.rows[0]?.user_id;
              console.log(`Владелец поста: ownerId=${ownerId}`);
          }

          if (ownerId === userId) {
              console.log('Пользователь пытается поставить лайк/дизлайк своему собственному контенту. Операция игнорируется.');
              return { message: 'Нельзя лайкать или дизлайкать свой собственный контент.' };
          }

          let query;
          let params;

          if (commentId !== null) {
              // Лайк к комментарию
              query = `
                  INSERT INTO likes (post_id, user_id, type, comment_id)
                  VALUES ($1, $2, $3, $4)
                  ON CONFLICT (user_id, comment_id) WHERE comment_id IS NOT NULL
                  DO UPDATE SET type = EXCLUDED.type
                  RETURNING *
              `;
              params = [postId, userId, type, commentId];
          } else {
              // Лайк к посту
              query = `
                  INSERT INTO likes (post_id, user_id, type, comment_id)
                  VALUES ($1, $2, $3, NULL)
                  ON CONFLICT (user_id, post_id) WHERE comment_id IS NULL
                  DO UPDATE SET type = EXCLUDED.type
                  RETURNING *
              `;
              params = [postId, userId, type];
          }

          const result = await pool.query(query, params);

          if (ownerId) {
              await userModel.updateUserRating(ownerId);
          }

          await this._updatePostLikeCounts(postId, commentId);

          return result.rows[0];
      } catch (error) {
          console.error('Ошибка в addLike:', error);
          throw error;
      }
  }

    async removeLike(postId, userId, commentId = null) {
            try {
              let query = 'DELETE FROM likes WHERE user_id = $1 AND post_id = $2';
              let params = [userId, postId];
          
              if (commentId !== null) {
                query += ' AND comment_id = $3';
                params.push(commentId);
              } else {
                query += ' AND comment_id IS NULL';
              }
        
            const result = await pool.query(query, params);
        
            let ownerId;
            if (commentId !== null) {
              const comment = await pool.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);
              ownerId = comment.rows[0]?.user_id;
              console.log(`Владелец комментария: ownerId=${ownerId}`);
            } else if (postId !== null) {
              const post = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
              ownerId = post.rows[0]?.user_id;
              console.log(`Владелец поста: ownerId=${ownerId}`);
            }
        
            console.log(`Лайк удален пользователем ID: ${userId}, владельцем контента ID: ${ownerId}`);
        
            if (ownerId && ownerId !== userId) {
              await userModel.updateUserRating(ownerId);
            }
        
            // Обновление счетчиков
            await this._updatePostLikeCounts(postId);
        
            return result.rows[0];
          } catch (error) {
            console.error('Ошибка в removeLike:', error);
            throw error;
          }
    }

    async getLikesCount(postId = null, commentId = null) {
        try {
            let query = 'SELECT type, COUNT(*) AS count FROM likes WHERE post_id = $1';
            let params = [postId];
        
            if (commentId !== null) {
              query += ' AND comment_id = $2';
              params.push(commentId);
            } else {
              query += ' AND comment_id IS NULL';
            }
        
            query += ' GROUP BY type';
        
            const result = await pool.query(query, params);
            return result.rows;
          } catch (error) {
            console.error('Ошибка в getLikesCount:', error);
            throw error;
          }
    }

    async getUserLike(postId, userId, commentId = null) {
      try {
        let query = 'SELECT type FROM likes WHERE user_id = $1 AND post_id = $2';
        let params = [userId, postId];
  
        if (commentId !== null) {
          query += ' AND comment_id = $3';
          params.push(commentId);
        } else {
          query += ' AND comment_id IS NULL';
        }
  
        const result = await pool.query(query, params);
        return result.rows[0];
      } catch (error) {
        console.error('Ошибка в getUserLike:', error);
        throw error;
      }
    }
}

module.exports = new likeModel();