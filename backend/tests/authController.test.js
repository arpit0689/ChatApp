jest.mock('../src/services/userService', () => ({
  createUser: jest.fn(),
  loginUser: jest.fn(),
  createGuestUser: jest.fn(),
}));

jest.mock('../src/utils/jwt', () => ({
  generateToken: jest.fn(),
}));

const config = require('../src/config/env');
const userService = require('../src/services/userService');
const { generateToken } = require('../src/utils/jwt');
const authController = require('../src/controllers/authController');

const createResponse = () => {
  const response = {};
  response.status = jest.fn(() => response);
  response.json = jest.fn(() => response);
  return response;
};

describe('AuthController', () => {
  const originalAuthSetting = config.ENABLE_AUTH;

  beforeEach(() => {
    jest.clearAllMocks();
    config.ENABLE_AUTH = true;
  });

  afterAll(() => {
    config.ENABLE_AUTH = originalAuthSetting;
  });

  test('register creates an account and returns a JWT', async () => {
    const user = {
      _id: '64b7f1a2c3d4e5f678901234',
      username: 'new_user',
      email: 'new@example.com',
    };
    userService.createUser.mockResolvedValue(user);
    generateToken.mockReturnValue('signed-token');
    const request = {
      body: { username: user.username, email: user.email, password: 'secret123' },
    };
    const response = createResponse();
    const next = jest.fn();

    await authController.register(request, response, next);

    expect(userService.createUser).toHaveBeenCalledWith(
      'new_user',
      'new@example.com',
      'secret123'
    );
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ token: 'signed-token' }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('login returns the authenticated user and service token', async () => {
    userService.loginUser.mockResolvedValue({
      user: {
        _id: '64b7f1a2c3d4e5f678901234',
        username: 'member',
        email: 'member@example.com',
      },
      token: 'login-token',
    });
    const response = createResponse();

    await authController.login(
      { body: { username: 'member', password: 'secret123' } },
      response,
      jest.fn()
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ token: 'login-token' }),
      })
    );
  });

  test('guest login remains available while account auth is enabled', async () => {
    userService.createGuestUser.mockResolvedValue({
      _id: '64b7f1a2c3d4e5f678901234',
      username: 'visitor',
    });
    const response = createResponse();

    await authController.guestLogin(
      { body: { username: 'visitor' } },
      response,
      jest.fn()
    );

    expect(userService.createGuestUser).toHaveBeenCalledWith('visitor');
    expect(response.status).toHaveBeenCalledWith(201);
  });

  test('registration reports when account authentication is disabled', async () => {
    config.ENABLE_AUTH = false;
    const response = createResponse();

    await authController.register(
      {
        body: {
          username: 'member',
          email: 'member@example.com',
          password: 'secret123',
        },
      },
      response,
      jest.fn()
    );

    expect(response.status).toHaveBeenCalledWith(403);
    expect(userService.createUser).not.toHaveBeenCalled();
  });
});
