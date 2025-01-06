import { Test, TestingModule } from '@nestjs/testing';
import { GlobalExceptionFilter } from './global.exception.filter';



describe('GlobalExceptionFilter', () => {
  let service: GlobalExceptionFilter;
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalExceptionFilter],
      providers: [
        
      ],
    }).compile();

    service = module.get(GlobalExceptionFilter);
    
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('catch', () => {
    it('should', () => {

    });
  });
});