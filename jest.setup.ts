import '@testing-library/jest-dom'

// Silence console.error in tests unless explicitly needed
jest.spyOn(console, 'error').mockImplementation(() => {})
