const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MoleculerError } = require('moleculer').Errors;

module.exports = {
  name: 'auth',

  settings: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRATION: '24h',
    REFRESH_TOKEN_EXPIRATION: '7d'
  },

  actions: {
    /**
     * Login with email and password
     */
    login: {
      params: {
        email: { type: 'email' },
        password: { type: 'string', min: 6 }
      },
      async handler(ctx) {
        const { email, password } = ctx.params;

        // Find user
        const user = await ctx.call('users.findByEmail', { email });

        if (!user) {
          throw new MoleculerError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new MoleculerError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        // Store refresh token
        await ctx.call('users.updateRefreshToken', {
          userId: user.id,
          refreshToken
        });

        return {
          accessToken,
          refreshToken,
          expiresIn: 86400, // 24 hours in seconds
          tokenType: 'Bearer'
        };
      }
    },

    /**
     * Refresh access token
     */
    refresh: {
      params: {
        refreshToken: { type: 'string' }
      },
      async handler(ctx) {
        const { refreshToken } = ctx.params;

        try {
          const decoded = jwt.verify(refreshToken, this.settings.JWT_SECRET);

          // Verify refresh token in database
          const user = await ctx.call('users.get', { id: decoded.userId });

          if (!user || user.refreshToken !== refreshToken) {
            throw new MoleculerError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
          }

          // Generate new tokens
          const accessToken = this.generateAccessToken(user);
          const newRefreshToken = this.generateRefreshToken(user);

          // Update refresh token
          await ctx.call('users.updateRefreshToken', {
            userId: user.id,
            refreshToken: newRefreshToken
          });

          return {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: 86400,
            tokenType: 'Bearer'
          };
        } catch (err) {
          throw new MoleculerError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }
      }
    },

    /**
     * Logout
     */
    logout: {
      auth: true,
      async handler(ctx) {
        const userId = ctx.meta.user.id;

        // Clear refresh token
        await ctx.call('users.updateRefreshToken', {
          userId,
          refreshToken: null
        });

        return { success: true };
      }
    },

    /**
     * Verify token and return user
     */
    verify: {
      params: {
        token: { type: 'string' }
      },
      async handler(ctx) {
        const { token } = ctx.params;

        try {
          const decoded = jwt.verify(token, this.settings.JWT_SECRET);
          const user = await ctx.call('users.get', { id: decoded.userId });

          return {
            valid: true,
            user: this.sanitizeUser(user)
          };
        } catch (err) {
          return {
            valid: false,
            error: err.message
          };
        }
      }
    }
  },

  methods: {
    generateAccessToken(user) {
      return jwt.sign(
        {
          userId: user.id,
          email: user.email
        },
        this.settings.JWT_SECRET,
        { expiresIn: this.settings.JWT_EXPIRATION }
      );
    },

    generateRefreshToken(user) {
      return jwt.sign(
        {
          userId: user.id,
          type: 'refresh'
        },
        this.settings.JWT_SECRET,
        { expiresIn: this.settings.REFRESH_TOKEN_EXPIRATION }
      );
    },

    sanitizeUser(user) {
      const { password, refreshToken, ...sanitized } = user;
      return sanitized;
    }
  }
};
