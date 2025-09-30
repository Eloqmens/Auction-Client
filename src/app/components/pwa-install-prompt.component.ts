import { Component, OnInit, OnDestroy } from '@angular/core';
import { PWAService } from '../services/pwa.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pwa-install-prompt',
  template: `
    <div *ngIf="showInstallPrompt" class="pwa-install-banner">
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon">
          <i class="fas fa-mobile-alt"></i>
        </div>
        <div class="pwa-banner-text">
          <h6 class="mb-1">Установить приложение</h6>
          <small>Получите быстрый доступ к аукциону</small>
        </div>
        <div class="pwa-banner-actions">
          <button class="btn btn-sm btn-outline-light me-2" (click)="dismissPrompt()">
            <i class="fas fa-times"></i>
          </button>
          <button class="btn btn-sm btn-light" (click)="installApp()">
            <i class="fas fa-download me-1"></i>
            Установить
          </button>
        </div>
      </div>
    </div>

    <!-- Индикатор статуса подключения -->
    <div *ngIf="!isOnline" class="offline-indicator">
      <i class="fas fa-wifi me-2"></i>
      Нет подключения к интернету
    </div>

    <!-- Информация о PWA статусе -->
    <div *ngIf="showPWAInfo" class="pwa-status-info">
      <div class="pwa-status-content">
        <h6>Статус PWA</h6>
        <div class="pwa-features">
          <div class="pwa-feature" [class.active]="pwaSupport.serviceWorker">
            <i class="fas" [class.fa-check]="pwaSupport.serviceWorker" [class.fa-times]="!pwaSupport.serviceWorker"></i>
            Service Worker
          </div>
          <div class="pwa-feature" [class.active]="pwaSupport.manifest">
            <i class="fas" [class.fa-check]="pwaSupport.manifest" [class.fa-times]="!pwaSupport.manifest"></i>
            Manifest
          </div>
          <div class="pwa-feature" [class.active]="pwaSupport.notifications">
            <i class="fas" [class.fa-check]="pwaSupport.notifications" [class.fa-times]="!pwaSupport.notifications"></i>
            Уведомления
          </div>
          <div class="pwa-feature" [class.active]="isStandalone">
            <i class="fas" [class.fa-check]="isStandalone" [class.fa-times]="!isStandalone"></i>
            Режим приложения
          </div>
        </div>
        <button class="btn btn-sm btn-secondary mt-2" (click)="togglePWAInfo()">
          Скрыть
        </button>
      </div>
    </div>

    <!-- Кнопка для показа PWA информации -->
    <button *ngIf="!showPWAInfo && isStandalone" 
            class="btn btn-sm btn-outline-secondary pwa-info-toggle"
            (click)="togglePWAInfo()">
      <i class="fas fa-info-circle"></i>
    </button>
  `,
  styles: [`
    .pwa-install-banner {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 1050;
      animation: slideUp 0.3s ease-out;
    }

    .pwa-banner-content {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
    }

    .pwa-banner-icon {
      font-size: 1.5rem;
      opacity: 0.9;
    }

    .pwa-banner-text {
      flex: 1;
    }

    .pwa-banner-text h6 {
      color: white;
      font-weight: 600;
    }

    .pwa-banner-text small {
      opacity: 0.8;
    }

    .pwa-banner-actions {
      display: flex;
      align-items: center;
    }

    .offline-indicator {
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: #e74c3c;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      z-index: 1040;
      animation: slideDown 0.3s ease-out;
    }

    .pwa-status-info {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1050;
      max-width: 280px;
    }

    .pwa-status-content {
      padding: 16px;
    }

    .pwa-status-content h6 {
      margin-bottom: 12px;
      color: #2c3e50;
    }

    .pwa-features {
      display: grid;
      gap: 8px;
    }

    .pwa-feature {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .pwa-feature.active {
      color: #28a745;
    }

    .pwa-feature.active i {
      color: #28a745;
    }

    .pwa-feature:not(.active) i {
      color: #dc3545;
    }

    .pwa-info-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      z-index: 1040;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideDown {
      from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .pwa-install-banner {
        left: 10px;
        right: 10px;
        bottom: 10px;
      }

      .pwa-banner-content {
        padding: 12px;
      }

      .pwa-status-info {
        right: 10px;
        bottom: 10px;
        max-width: calc(100vw - 20px);
      }
    }
  `]
})
export class PWAInstallPromptComponent implements OnInit, OnDestroy {
  showInstallPrompt = false;
  showPWAInfo = false;
  isOnline = true;
  isStandalone = false;
  pwaSupport = {
    serviceWorker: false,
    manifest: false,
    notifications: false,
    installPrompt: false
  };

  private destroy$ = new Subject<void>();

  constructor(private pwaService: PWAService) {}

  ngOnInit(): void {
    // Проверяем поддержку PWA
    this.pwaSupport = this.pwaService.checkPWASupport();
    this.isStandalone = this.pwaService.isRunningStandalone();

    // Отслеживаем статус подключения
    this.pwaService.isOnline$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        this.isOnline = isOnline;
      });

    // Показываем промпт установки через некоторое время
    setTimeout(() => {
      if (this.pwaService.canInstall() && !this.isStandalone) {
        this.showInstallPrompt = true;
      }
    }, 3000);

    // Скрываем промпт автоматически через 30 секунд
    setTimeout(() => {
      this.showInstallPrompt = false;
    }, 33000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async installApp(): Promise<void> {
    const installed = await this.pwaService.promptInstall();
    if (installed) {
      this.showInstallPrompt = false;
      // Показываем уведомление об успешной установке
      await this.pwaService.showNotification('Приложение установлено!', {
        body: 'Теперь вы можете запускать аукцион прямо с рабочего стола',
        icon: '/icons/icon512_rounded.png'
      });
    }
  }

  dismissPrompt(): void {
    this.showInstallPrompt = false;
  }

  togglePWAInfo(): void {
    this.showPWAInfo = !this.showPWAInfo;
  }
}
