// Message module for messaging application

const database = require("../database");
const AppError = require("../AppError");

class CustomMessage {
  // Create a new message
  static async sendMessage({ from_username, to_username, body }) {
    const result = await database.query(
      `INSERT INTO custom_messages (
              from_username,
              to_username,
              message_body,
              sent_at)
            VALUES ($1, $2, $3, current_timestamp)
            RETURNING message_id, from_username, to_username, message_body, sent_at`,
      [from_username, to_username, body]
    );

    return result.rows[0];
  }

  // Mark a message as read
  static async markMessageAsRead(messageId) {
    const result = await database.query(
      `UPDATE custom_messages
           SET read_at = current_timestamp
           WHERE message_id = $1
           RETURNING message_id, read_at`,
      [messageId]
    );

    if (!result.rows[0]) {
      throw new AppError(`Message not found: ${messageId}`, 404);
    }

    return result.rows[0];
  }

  // Get message by ID
  static async getMessageById(messageId) {
    const result = await database.query(
      `SELECT m.message_id,
                m.from_username,
                f.first_name AS from_first_name,
                f.last_name AS from_last_name,
                f.phone AS from_phone,
                m.to_username,
                t.first_name AS to_first_name,
                t.last_name AS to_last_name,
                t.phone AS to_phone,
                m.message_body,
                m.sent_at,
                m.read_at
          FROM custom_messages AS m
            JOIN custom_users AS f ON m.from_username = f.username
            JOIN custom_users AS t ON m.to_username = t.username
          WHERE m.message_id = $1`,
      [messageId]
    );

    let message = result.rows[0];

    if (!message) {
      throw new AppError(`Message not found: ${messageId}`, 404);
    }

    return {
      message_id: message.message_id,
      from_user: {
        username: message.from_username,
        first_name: message.from_first_name,
        last_name: message.from_last_name,
        phone: message.from_phone,
      },
      to_user: {
        username: message.to_username,
        first_name: message.to_first_name,
        last_name: message.to_last_name,
        phone: message.to_phone,
      },
      message_body: message.message_body,
      sent_at: message.sent_at,
      read_at: message.read_at,
    };
  }
}

module.exports = CustomMessage;
