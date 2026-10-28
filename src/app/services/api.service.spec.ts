import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('posts the photo as multipart and returns the ideas payload', () => {
    const file = new File(['bytes'], 'cup.png', { type: 'image/png' });
    const data = {
      sourceObject: { name: 'Cup', material: 'plastic', condition: 'reusable' },
      ideas: [],
    };
    let result: unknown;
    api.generateIdeas(file).subscribe((payload) => {
      result = payload;
    });

    const req = http.expectOne('http://127.0.0.1:3000/api/ai/generate-ideas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    const sent = (req.request.body as FormData).get('image');
    expect(sent).toBeInstanceOf(File);
    expect((sent as File).name).toBe('cup.png');

    req.flush({ success: true, data });
    expect(result).toEqual(data);
  });

  it('prefixes relative upload paths with the API base', () => {
    expect(api.imageUrl('/uploads/generated/x.png')).toBe(
      'http://127.0.0.1:3000/uploads/generated/x.png',
    );
    expect(api.imageUrl(null)).toBeNull();
  });
});
