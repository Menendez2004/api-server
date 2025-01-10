export class MocksUserService {
  static user = {
    firstName: 'John',
    lastName: 'Doe',
    userName: 'johndoe',
    email: 'johndoe@example.com',
    address: '123 Main St, Springfield',
    password: 'hashedPassword123',
  };

  static userCreate = {
    firstName: 'John',
    lastName: 'Doe',
    userName: 'johndoe',
    email: 'johndoe@example.com',
    address: '123 Main St, Springfield',
    password: expect.any(String),
  };

  static userFail = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'invalid-email',
    address: '123 Main St, Springfield',
    password: 'password123',
  };

  static userFindByEmail = {
    id: '0fe3dbd4-aee0-47db-ac4e-56e2e3382a15',
    email: 'johndoe@example.com',
  };
}
