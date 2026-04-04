import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxCurrency, NgxCurrencyConfig } from 'ngx-currency';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

// Configuração global de moeda — aplicada em todos os campos currencyMask do app
const currencyConfig: NgxCurrencyConfig = {
  align: 'left',
  allowNegative: false,
  allowZero: false,
  decimal: ',',
  precision: 2,
  prefix: 'R$ ',
  suffix: '',
  thousands: '.',
  nullable: true,   // permite que o campo fique vazio (null) em vez de R$ 0,00
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideEnvironmentNgxCurrency(currencyConfig),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
