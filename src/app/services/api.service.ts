import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, tap, type Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TutorialStepDto {
  step: number;
  title: string;
  description: string;
}

export interface TutorialDto {
  materials: string[];
  tools: string[];
  steps: TutorialStepDto[];
  safetyNotes: string[];
}

export interface IdeaImageDto {
  url: string | null;
  status: 'completed' | 'failed';
}

export interface MarketPriceDto {
  status: 'estimated';
  currency: 'USD';
  estimatedCost: number | null;
  estimatedSellingPrice: number | null;
}

export interface GeneratedIdea {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  image: IdeaImageDto;
  marketPrice: MarketPriceDto;
  tutorial: TutorialDto;
}

export interface SourceObjectDto {
  name: string;
  material: string;
  condition: string;
}

export interface GenerateIdeasResult {
  sourceObject: SourceObjectDto;
  ideas: GeneratedIdea[];
  /** Stable anonymous owner id (null for signed-in callers); reused for reads. */
  anonymousOwnerId: string | null;
}

export interface LibrarySourceObjectDto {
  id: string;
  name: string;
  material: string;
  condition: string;
  imageUrl: string | null;
}

/** Persisted idea as returned by the library endpoint (`id` is the row UUID). */
export interface LibraryIdea extends GeneratedIdea {
  intendedUse: string;
  sourceObject: LibrarySourceObjectDto;
  createdAt: string;
}

export interface LibraryPage {
  items: LibraryIdea[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LibraryIdeasQuery {
  q?: string;
  sourceObjectId?: string;
  difficulty?: string;
  hasPrice?: boolean;
  sort: string;
  page: number;
  limit: number;
}

export interface SourceObjectSummary {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

const ANONYMOUS_OWNER_STORAGE_KEY = 'dti.anonymousOwnerId';
const ANONYMOUS_OWNER_HEADER = 'x-anonymous-owner-id';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  generateIdeas(image: File): Observable<GenerateIdeasResult> {
    const form = new FormData();
    form.append('image', image, image.name);
    return this.http
      .post<ApiEnvelope<GenerateIdeasResult>>(`${this.baseUrl}/api/ai/generate-ideas`, form, {
        headers: this.ownershipHeaders(),
      })
      .pipe(
        map((res) => res.data),
        tap((result) => this.storeAnonymousOwnerId(result.anonymousOwnerId)),
      );
  }

  listIdeas(query: LibraryIdeasQuery): Observable<LibraryPage> {
    let params = new HttpParams()
      // .set('sort', query.sort)
      .set('page', String(query.page))
      .set('limit', String(query.limit));
    if (query.q !== undefined && query.q.length > 0) {
      params = params.set('q', query.q);
    }
    if (query.sourceObjectId !== undefined && query.sourceObjectId.length > 0) {
      params = params.set('sourceObjectId', query.sourceObjectId);
    }
    if (query.difficulty !== undefined && query.difficulty.length > 0) {
      params = params.set('difficulty', query.difficulty);
    }
    if (query.hasPrice !== undefined) {
      params = params.set('hasPrice', String(query.hasPrice));
    }
    return this.http
      .get<ApiEnvelope<LibraryPage>>(`${this.baseUrl}/api/ai/ideas`, {
        headers: this.ownershipHeaders(),
        params,
      })
      .pipe(map((res) => res.data));
  }

  listSourceObjects(): Observable<SourceObjectSummary[]> {
    return this.http
      .get<ApiEnvelope<{ items: SourceObjectSummary[] }>>(`${this.baseUrl}/api/ai/source-objects`, {
        headers: this.ownershipHeaders(),
      })
      .pipe(map((res) => res.data.items));
  }

  imageUrl(path: string | null): string | null {
    return path ? `${this.baseUrl}${path}` : null;
  }

  private ownershipHeaders(): Record<string, string> {
    const id = this.loadAnonymousOwnerId();
    return id === null ? {} : { [ANONYMOUS_OWNER_HEADER]: id };
  }

  private loadAnonymousOwnerId(): string | null {
    try {
      return localStorage.getItem(ANONYMOUS_OWNER_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private storeAnonymousOwnerId(id: string | null | undefined): void {
    if (!id) {
      return;
    }
    try {
      localStorage.setItem(ANONYMOUS_OWNER_STORAGE_KEY, id);
    } catch {
      // Private mode: generations still work, the library just won't persist.
    }
  }
}
