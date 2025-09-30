import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PWAService {
  private promptEvent: any;
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();

  constructor() {
    this.listenForOnlineStatus();
    this.listenForInstallPrompt();
  }

  /**
   * Отслеживание статуса подключения к интернету
   */
  private listenForOnlineStatus(): void {
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(isOnline => {
      this.isOnlineSubject.next(isOnline);
    });
  }

  /**
   * Отслеживание события установки PWA
   */
  private listenForInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Событие установки получено');
      e.preventDefault();
      this.promptEvent = e;
    });
  }

  /**
   * Проверка, можно ли установить приложение
   */
  canInstall(): boolean {
    return !!this.promptEvent;
  }

  /**
   * Показать диалог установки PWA
   */
  async promptInstall(): Promise<boolean> {
    if (!this.promptEvent) {
      console.log('PWA: Событие установки недоступно');
      return false;
    }

    const result = await this.promptEvent.prompt();
    console.log('PWA: Результат установки:', result);
    
    if (result.outcome === 'accepted') {
      console.log('PWA: Пользователь принял установку');
      this.promptEvent = null;
      return true;
    } else {
      console.log('PWA: Пользователь отклонил установку');
      return false;
    }
  }

  /**
   * Проверка, запущено ли приложение как PWA
   */
  isRunningStandalone(): boolean {
    return (window.matchMedia('(display-mode: standalone)').matches) ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  }

  /**
   * Получение информации о Service Worker
   */
  getServiceWorkerStatus(): Observable<string> {
    return new Observable(observer => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          if (registration.active) {
            observer.next('active');
          } else if (registration.installing) {
            observer.next('installing');
          } else if (registration.waiting) {
            observer.next('waiting');
          } else {
            observer.next('unknown');
          }
        }).catch(error => {
          console.error('PWA: Ошибка получения статуса SW:', error);
          observer.next('error');
        });
      } else {
        observer.next('not_supported');
      }
    });
  }

  /**
   * Обновление Service Worker
   */
  async updateServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        console.log('PWA: Service Worker обновлен');
        return true;
      } catch (error) {
        console.error('PWA: Ошибка обновления SW:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Показать уведомление (если разрешено)
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('PWA: Уведомления не поддерживаются');
      return false;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, options);
      return true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, options);
        return true;
      }
    }

    console.log('PWA: Уведомления заблокированы');
    return false;
  }

  /**
   * Запросить разрешение на уведомления
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  /**
   * Получить статус разрешения уведомлений
   */
  getNotificationPermission(): NotificationPermission {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  /**
   * Проверка поддержки различных PWA функций
   */
  checkPWASupport(): {
    serviceWorker: boolean;
    manifest: boolean;
    notifications: boolean;
    installPrompt: boolean;
  } {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      manifest: 'manifest' in document.createElement('link'),
      notifications: 'Notification' in window,
      installPrompt: 'BeforeInstallPromptEvent' in window
    };
  }
}
