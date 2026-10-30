import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
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

  it('stores the anonymous owner id and sends it back on later calls', () => {
    const file = new File(['bytes'], 'cup.png', { type: 'image/png' });
    api.generateIdeas(file).subscribe();
    http
      .expectOne('http://127.0.0.1:3000/api/ai/generate-ideas')
      .flush({ success: true, data: { ideas: [], anonymousOwnerId: 'anon-uuid-1' } });
    expect(localStorage.getItem('dti.anonymousOwnerId')).toBe('anon-uuid-1');

    api.generateIdeas(file).subscribe();
    const retry = http.expectOne('http://127.0.0.1:3000/api/ai/generate-ideas');
    expect(retry.request.headers.get('x-anonymous-owner-id')).toBe('anon-uuid-1');
    retry.flush({ success: true, data: { ideas: [], anonymousOwnerId: 'anon-uuid-1' } });
  });

  it('lists ideas with only the set filters as query params', () => {
    let result: unknown;
    api
      .listIdeas({ sort: 'title', page: 2, limit: 24, q: 'vase', hasPrice: true })
      .subscribe((page) => {
        result = page;
      });

    const req = http.expectOne((request) => request.url === 'http://127.0.0.1:3000/api/ai/ideas');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('sort')).toBe('title');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('24');
    expect(req.request.params.get('q')).toBe('vase');
    expect(req.request.params.get('hasPrice')).toBe('true');
    expect(req.request.params.has('difficulty')).toBe(false);
    expect(req.request.params.has('sourceObjectId')).toBe(false);

    const page = { items: [], page: 2, limit: 24, total: 0, totalPages: 0 };
    req.flush({ success: true, data: page });
    expect(result).toEqual(page);
  });

  it('lists source objects', () => {
    let result: unknown;
    api.listSourceObjects().subscribe((items) => {
      result = items;
    });

    const req = http.expectOne('http://127.0.0.1:3000/api/ai/source-objects');
    const items = [
      { id: 's1', name: 'Cup', imageUrl: null, createdAt: '2026-01-01T00:00:00.000Z' },
    ];
    req.flush({ success: true, data: { items } });
    expect(result).toEqual(items);
  });
});
