import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';



describe('TokenService', () => {
  let service: TokenService;
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenService],
      providers: [
        
      ],
    }).compile();

    service = module.get(TokenService);
    
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createToken', () => {
    it('should', () => {

    });
  });

  describe('findAuthToken', () => {
    it('should', () => {

    });
  });

  describe('encodeToken', () => {
    it('should', () => {

    });
  });

  describe('decodeToken', () => {
    it('should', () => {

    });
  });
});