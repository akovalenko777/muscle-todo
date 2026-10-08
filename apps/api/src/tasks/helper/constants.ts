export const FAKE_HASH = '$2b$10$WOfbe0gESb4ADHgBeWHq0O9xPDONlExEe2GgBQvMkRd8x08TCmOZK'

// NOTE: lite password requirements just for testing
// TODO: for production set to default
export const PASSWORD_REQ = {
    minLength: 3,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0
  }