// User class for messaging app

const database = require("../database");
const bcrypt = require("bcrypt");
const AppError = require("../AppError");

const { BCRYPT_SALT_ROUNDS } = require("../config");

// User of the application

class MessageUser {
  // Register a new user
  static async signUp({
    username,
    password,
    firstName,
    lastName,
    phoneNumber,
  }) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const result = await database.query(
      `INSERT INTO app_users (
              username,
              password,
              first_name,
              last_name,
              phone_number,
              registration_date,
              last_login_date)
            VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
            RETURNING username, password, first_name, last_name, phone_number`,
      [username, hashedPassword, firstName, lastName, phoneNumber]
    );
    return result.rows[0];
  }

  // Authenticate user
  static async logIn(username, password) {
    const result = await database.query(
      "SELECT password FROM app_users WHERE username = $1",
      [username]
    );
    let user = result.rows[0];

    return user && (await bcrypt.compare(password, user.password));
  }

  // Update last login date
  static async updateLastLogin(username) {
    const result = await database.query(
      `UPDATE app_users
           SET last_login_date = current_timestamp
           WHERE username = $1
           RETURNING username`,
      [username]
    );

    if (!result.rows[0]) {
      throw new AppError(`User not found: ${username}`, 404);
    }
  }

  // Retrieve basic info on all users
  static async getAllUsers() {
    const result = await database.query(
      `SELECT username,
                first_name,
                last_name,
                phone_number
            FROM app_users
            ORDER BY username`
    );

    return result.rows;
  }

  // Get user by username
  static async getUserByUsername(username) {
    const result = await database.query(
      `SELECT username,
                first_name,
                last_name,
                phone_number,
                registration_date,
                last_login_date
            FROM app_users
            WHERE username = $1`,
      [username]
    );

    if (!result.rows[0]) {
      throw new AppError(`User not found: ${username}`, 404);
    }

    return result.rows[0];
  }

  // Return messages sent by this user
  static async getMessagesSentByUser(username) {
    const result = await database.query(
      `SELECT m.id,
                m.receiver_username,
                u.first_name,
                u.last_name,
                u.phone_number,
                m.message_body,
                m.sent_at,
                m.read_at
          FROM messages AS m
            JOIN app_users AS u ON m.receiver_username = u.username
          WHERE sender_username = $1`,
      [username]
    );

    return result.rows.map((m) => ({
      id: m.id,
      receiver_user: {
        username: m.receiver_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone_number: m.phone_number,
      },
      message_body: m.message_body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }

  // Return messages sent to this user
  static async getMessagesReceivedByUser(username) {
    const result = await database.query(
      `SELECT m.id,
                m.sender_username,
                u.first_name,
                u.last_name,
                u.phone_number,
                m.message_body,
                m.sent_at,
                m.read_at
          FROM messages AS m
           JOIN app_users AS u ON m.sender_username = u.username
          WHERE receiver_username = $1`,
      [username]
    );

    return result.rows.map((m) => ({
      id: m.id,
      sender_user: {
        username: m.sender_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone_number: m.phone_number,
      },
      message_body: m.message_body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }
}

module.exports = MessageUser;
