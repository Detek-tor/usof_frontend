const Like = require('../models/likeModel')
const postModel = require('../models/postModel')
const pool = require('../config/db');

class likeController {
    async addLike(req, res) {
        const { type, postId, commentId } = req.body;
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
            const like = await Like.addLike(postId, userId, type, commentId);
            if (like.message) {
                return res.status(400).json({ message: like.message });
            }
            res.status(201).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} добавлен`, like });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async removeLike(req, res) {
        const { postId, commentId } = req.body;
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
            const like = await Like.removeLike(postId, userId, commentId);
            res.status(200).json({ message: 'Like removed', like });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getLikesCount(req, res) {
        const { postId, commentId } = req.query;
        try {
            const likesCount = await Like.getLikesCount(postId, commentId);
            res.status(200).json(likesCount);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getUserLike(req, res) {
        const { postId, commentId } = req.params;
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
            const like = await Like.getUserLike(postId, userId, commentId || null);
            res.status(200).json(like || null);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getAllLikes(req, res) {
        try {
            const likes = await Like.getAllLikes();
            res.status(200).json(likes);
          } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
          }
    }

    async updateLikeCounts(req, res) {
        let client;
        try {
            // Подключение к пулу соединений
            client = await pool.connect();

            // Обновление счётчиков для постов
            const postCounts = await client.query(`
                SELECT 
                    post_id,
                    COUNT(*) FILTER (WHERE type = 'like') AS likes_count,
                    COUNT(*) FILTER (WHERE type = 'dislike') AS dislikes_count
                FROM likes
                WHERE comment_id IS NULL
                GROUP BY post_id
            `);

            for (const row of postCounts.rows) {
                const { post_id, likes_count, dislikes_count } = row;

                await client.query(`
                    UPDATE posts
                    SET likes_count = $1, dislikes_count = $2
                    WHERE id = $3
                `, [likes_count, dislikes_count, post_id]);
            }

            // Обновление счётчиков для комментариев
            const commentCounts = await client.query(`
                SELECT 
                    comment_id,
                    COUNT(*) FILTER (WHERE type = 'like') AS likes_count,
                    COUNT(*) FILTER (WHERE type = 'dislike') AS dislikes_count
                FROM likes
                WHERE comment_id IS NOT NULL
                GROUP BY comment_id
            `);

            for (const row of commentCounts.rows) {
                const { comment_id, likes_count, dislikes_count } = row;

                await client.query(`
                    UPDATE comments
                    SET likes_count = $1, dislikes_count = $2
                    WHERE id = $3
                `, [likes_count || 0, dislikes_count || 0, comment_id]);
            }

            res.status(200).json({ message: 'Счетчики лайков и дизлайков обновлены успешно' });
        } catch (error) {
            console.error('Ошибка при обновлении счетчиков:', error);
            res.status(500).json({ message: 'Ошибка при обновлении счетчиков', error: error.message });
        } finally {
            // Освобождение соединения
            if (client) client.release();
        }
    }
}

module.exports = new likeController();