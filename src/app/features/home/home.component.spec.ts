import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { APP_ICONS } from '../../shared/icons';
import { Home } from './home.component';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        importProvidersFrom(LucideAngularModule.pick(APP_ICONS)),
      ],
    }).compileComponents();
  });

  it('should create the home page', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the slogan and upload area', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('One photo.');
    expect(compiled.querySelector('#upload')).toBeTruthy();
  });

  it('should render three transformation examples', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const articles = compiled.querySelectorAll('section[aria-labelledby="examples-heading"] article');
    expect(articles.length).toBe(3);
  });
});
