import { LocalAuthGuard } from './auth.local.guard';

describe('LocalAuthGuard', () => {
  let localAuthGuard: LocalAuthGuard;

  beforeEach(() => {
    localAuthGuard = new LocalAuthGuard();
  });

  it('should instantiate without errors', () => {
    expect(localAuthGuard).toBeDefined();
  });

  it('should bind the correct strategy ("local")', () => {
    expect(() => new LocalAuthGuard()).not.toThrow();
  });
});
