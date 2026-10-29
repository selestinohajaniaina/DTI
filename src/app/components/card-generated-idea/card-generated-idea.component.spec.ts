import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardGeneratedIdea } from './card-generated-idea.component';

describe('CardGeneratedIdea', () => {
  let component: CardGeneratedIdea;
  let fixture: ComponentFixture<CardGeneratedIdea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGeneratedIdea],
    }).compileComponents();

    fixture = TestBed.createComponent(CardGeneratedIdea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
