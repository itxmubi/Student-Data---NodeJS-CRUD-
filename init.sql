-- Auto-generated schema for studentCrud project
-- This file runs automatically when the Docker MySQL container starts fresh

CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;

-- Users table (used by authController.js)
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100)  NOT NULL,
  email           VARCHAR(100)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  last_login_at   DATETIME      NULL,
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table (used by authController.js)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  DATETIME     NOT NULL,
  revoked     TINYINT(1)   DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Students table (used by studentController.js)
CREATE TABLE IF NOT EXISTS students (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  roll_no   INT          NOT NULL,
  fees      INT          NOT NULL,
  class     INT          NOT NULL,
  medium    VARCHAR(50)  NOT NULL,
  created_at DATETIME    DEFAULT CURRENT_TIMESTAMP
);