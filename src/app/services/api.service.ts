import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

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
  status: 'not_found';
  amount: null;
  currency: null;
  sourceUrl: null;
  listingTitle: null;
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
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://127.0.0.1:3000';

  generateIdeas(image: File): Observable<GenerateIdeasResult> {
    const form = new FormData();
    form.append('image', image, image.name);
    return this.http
      .post<ApiEnvelope<GenerateIdeasResult>>(`${this.baseUrl}/api/ai/generate-ideas`, form)
      .pipe(map((res) => res.data));
  }

  imageUrl(path: string | null): string | null {
    return path ? `${this.baseUrl}${path}` : null;
  }
}
