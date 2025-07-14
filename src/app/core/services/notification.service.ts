import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  showProgress?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationData>();
  public notifications$ = this.notificationSubject.asObservable();

  success(title: string, message: string, duration: number = 5000): void {
    this.show({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration,
      showProgress: true
    });
  }

  error(title: string, message: string, duration: number = 7000): void {
    this.show({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      showProgress: true
    });
  }

  warning(title: string, message: string, duration: number = 5000): void {
    this.show({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      showProgress: true
    });
  }

  info(title: string, message: string, duration: number = 5000): void {
    this.show({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      showProgress: true
    });
  }

  private show(notification: NotificationData): void {
    this.notificationSubject.next(notification);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
