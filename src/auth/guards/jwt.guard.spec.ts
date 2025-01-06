import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt.guard';



describe('JwtAuthGuard', () => {
  let service: JwtAuthGuard;
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JwtAuthGuard],
      providers: [
        
      ],
    }).compile();

    service = module.get(JwtAuthGuard);
    
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRequest', () => {
    it('should', () => {

    });
  });

  describe('handleRequest', () => {
    it('should', () => {

    });
  });
});