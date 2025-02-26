import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/hello';

jest.mock('node-mocks-http', () => ({
  createMocks: jest.fn().mockImplementation(() => ({
    req: {},
    res: {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  }))
}));

describe('Hello API endpoint', () => {
  test('returns the correct response', () => {
    // Arrange
    const { req, res } = createMocks();
    
    // Act
    handler(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Hello from Next.js API' });
  });
});
