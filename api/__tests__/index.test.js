const { handler } = require('../index');

// Mock the pg Pool
jest.mock('pg', () => {
  const mockPool = {
    connect: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        query: jest.fn().mockImplementation(() => {
          return Promise.resolve({ rows: [{ now: new Date().toISOString() }] });
        }),
        release: jest.fn().mockImplementation(() => Promise.resolve())
      });
    })
  };
  return { Pool: jest.fn(() => mockPool) };
});

describe('API Lambda Handler', () => {
  test('should return a successful response', async () => {
    // Arrange
    const event = {};
    
    // Act
    const response = await handler(event);
    
    // Assert
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('message', 'Hello from API');
    expect(body).toHaveProperty('time');
  });

  test('should handle database errors', async () => {
    // Arrange
    const event = {};
    
    // Mock a failure
    const pg = require('pg');
    pg.Pool.mockImplementationOnce(() => ({
      connect: jest.fn().mockRejectedValueOnce(new Error('Database connection error'))
    }));
    
    // Act
    const response = await handler(event);
    
    // Assert
    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('error', 'Database connection error');
  });
});
