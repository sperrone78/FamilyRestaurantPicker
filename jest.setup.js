import '@testing-library/jest-dom';

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});