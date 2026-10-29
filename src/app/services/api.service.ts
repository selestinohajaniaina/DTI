import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
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
  currency: 'MGA';
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
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

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
