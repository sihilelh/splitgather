import userDAO from '../dao/userDAO.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - Plain text password
 * @returns {Promise<Object>} User object and JWT token
 * @throws {Error} If email already exists or registration fails
 */
export async function registerUser(userData) {
  const { name, email, password } = userData;

  // Check if user with email already exists
  const existingUser = await userDAO.findByEmail(email);
  if (existingUser) {
    const error = new Error('Email already exists');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await userDAO.create({
    name,
    email,
    passwordHash,
  });

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  // Remove password hash from user object before returning
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}

/**
 * Login a user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - Plain text password
 * @returns {Promise<Object>} User object and JWT token
 * @throws {Error} If credentials are invalid
 */
export async function loginUser(credentials) {
  const { email, password } = credentials;

  // Find user by email
  const user = await userDAO.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  // Remove password hash from user object before returning
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserById(id) {
  return await userDAO.findById(id);
}
