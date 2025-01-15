import { UserRoles } from '@prisma/client';

export class AuthentificationMock {
  static today = new Date();
  static user = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    userName: 'johndoe',
    email: 'johndoe@example.com',
    roleId: 2,
    address: '123 Main St, Springfield',
    password: 'hashedpassword123',
    createdAt: this.today,
    updatedAt: this.today,
  };

  static userRole: UserRoles = {
    id: 2,
    createdAt: this.today,
    updatedAt: this.today,
    name: 'CLIENT',
  };

  static accesToken =
    'DhaECGuLIyQSpZ81Zxuu4RTpLMGVXuWoi9QQfEFrrsDwTOJ5eLO2aaO5rEA27tsmKOlTKiYwd8qxEuYWoA0icrrGW9voXOBiT07h';
}
