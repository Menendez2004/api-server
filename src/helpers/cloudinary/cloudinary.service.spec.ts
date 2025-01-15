import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Readable } from 'stream';

jest.mock('cloudinary');
jest.mock('streamifier');

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let mockUploadStream: jest.Mock;
  let mockDestroyFile: jest.Mock;
  let mockCreateReadStream: jest.Mock;
  let mockPipe: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);

    mockPipe = jest.fn();
    mockCreateReadStream = jest.fn().mockReturnValue({ pipe: mockPipe });
    mockUploadStream = jest.fn();
    mockDestroyFile = jest.fn();

    jest
      .spyOn(streamifier, 'createReadStream')
      .mockImplementation(mockCreateReadStream);

    jest
      .spyOn(cloudinary.uploader, 'upload_stream')
      .mockImplementation(mockUploadStream);
    jest
      .spyOn(cloudinary.uploader, 'destroy')
      .mockImplementation(mockDestroyFile);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 4,
      destination: '',
      filename: '',
      path: '',
      stream: new Readable(),
    };

    it('should successfully upload a file', async () => {
      const mockResult = {
        public_id: 'test123',
        secure_url: 'https://test.com/image.jpg',
      };

      mockUploadStream.mockImplementation((options, callback) => {
        callback(null, mockResult);
        return { on: jest.fn() };
      });

      const result = await service.uploadFile(mockFile);

      expect(result).toEqual(mockResult);
      expect(mockUploadStream).toHaveBeenCalledWith(
        { resource_type: 'image' },
        expect.any(Function),
      );
      expect(mockCreateReadStream).toHaveBeenCalledWith(mockFile.buffer);
      expect(mockPipe).toHaveBeenCalled();
    });

    it('should handle upload failure', async () => {
      const mockError = new Error('Upload failed');

      mockUploadStream.mockImplementation((options, callback) => {
        callback(mockError, null);
        return { on: jest.fn() };
      });

      await expect(service.uploadFile(mockFile)).rejects.toThrow(
        'Upload failed',
      );
      expect(mockUploadStream).toHaveBeenCalledWith(
        { resource_type: 'image' },
        expect.any(Function),
      );
    });
  });

  describe('destroyFile', () => {
    const publicId = 'test123';

    it('should successfully destroy a file', async () => {
      const mockResult = { result: 'ok' };

      mockDestroyFile.mockImplementation((id, callback) => {
        callback(null, mockResult);
      });

      const result = await service.destroyFile(publicId);

      expect(result).toEqual(mockResult);
      expect(mockDestroyFile).toHaveBeenCalledWith(
        publicId,
        expect.any(Function),
      );
    });

    it('should handle destroy failure', async () => {
      const mockError = new Error('Destroy failed');

      mockDestroyFile.mockImplementation((id, callback) => {
        callback(mockError, null);
      });

      await expect(service.destroyFile(publicId)).rejects.toThrow(
        'Destroy failed',
      );
      expect(mockDestroyFile).toHaveBeenCalledWith(
        publicId,
        expect.any(Function),
      );
    });
  });
});
