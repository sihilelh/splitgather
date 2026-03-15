import * as authService from '../services/authService.js';

/**
 * Handle user registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        const result = await authService.registerUser({
            name,
            email,
            password,
        });

        res.status(201).json({
            success: true,
            ...result,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Registration failed',
        });
    }
}

/**
 * Handle user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const result = await authService.loginUser({
            email,
            password,
        });

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Login failed',
        });
    }
}

/**
 * Handle user me
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function me(req, res) {
    try {
        const { user } = req;
        // Fetch full user from database to include name and other fields
        const fullUser = await authService.getUserById(user.id);
        if (!fullUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        // Remove password hash before returning
        const { passwordHash: _, ...userWithoutPassword } = fullUser;
        res.status(200).json({
            success: true,
            user: userWithoutPassword,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Me failed',
        });
    }
}
