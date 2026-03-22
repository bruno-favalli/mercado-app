import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompraAtiva } from './compra-ativa';

describe('CompraAtiva', () => {
  let component: CompraAtiva;
  let fixture: ComponentFixture<CompraAtiva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompraAtiva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompraAtiva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
