import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { getEndpointUrl } from '../config/app.config';
import { Language } from './translation.service';

export interface UserPreferences {
  language: Language;
  theme: 'light' | 'dark';
  currency: string;
  notifications: {
    email: boolean;
    priceAlerts: boolean;
    tradingAlerts: boolean;
    push: boolean;
  };
  trading: {
    defaultAmount: number;
    riskLevel: 'low' | 'medium' | 'high';
    autoTrade: boolean;
  };
}

export interface Message {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'trade';
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actions?: MessageAction[];
  metadata?: Record<string, any>;
}

export interface MessageAction {
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
  data?: any;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  priceAlerts: boolean;
  tradingAlerts: boolean;
  securityAlerts: boolean;
  marketUpdates: boolean;
  portfolioReports: boolean;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  timezone?: string;
  avatar?: string;
  preferences: UserPreferences;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private isUpdatingPreferences = signal<boolean>(false);
  private isLoadingMessages = signal<boolean>(false);

  readonly isUpdatingPreferences$ = this.isUpdatingPreferences.asReadonly();
  readonly isLoadingMessages$ = this.isLoadingMessages.asReadonly();

  constructor(private http: HttpClient) {}


  // Get user preferences
  getPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(
      getEndpointUrl('user', 'preferences')
    ).pipe(
      catchError(error => {
        console.error('Error fetching preferences:', error);
        return throwError(() => error);
      })
    );
  }

  // Update user preferences
  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    this.isUpdatingPreferences.set(true);

    return this.http.put<UserPreferences>(
      getEndpointUrl('user', 'preferences'),
      preferences
    ).pipe(
      tap(() => this.isUpdatingPreferences.set(false)),
      catchError(error => {
        this.isUpdatingPreferences.set(false);
        console.error('Error updating preferences:', error);
        return throwError(() => error);
      })
    );
  }

  // Get user messages
  getMessages(page = 1, limit = 20, unreadOnly = false): Observable<{ messages: Message[]; total: number; unreadCount: number }> {
    this.isLoadingMessages.set(true);
    const params = `?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`;

    return this.http.get<{ messages: Message[]; total: number; unreadCount: number }>(
      `${getEndpointUrl('user', 'messages')}${params}`
    ).pipe(
      tap(() => this.isLoadingMessages.set(false)),
      catchError(error => {
        this.isLoadingMessages.set(false);
        console.error('Error fetching messages:', error);
        return throwError(() => error);
      })
    );
  }

  // Mark message as read
  markMessageAsRead(messageId: string): Observable<void> {
    return this.http.patch<void>(
      `${getEndpointUrl('user', 'messages')}/${messageId}/read`,
      {}
    ).pipe(
      catchError(error => {
        console.error('Error marking message as read:', error);
        return throwError(() => error);
      })
    );
  }

  // Mark all messages as read
  markAllMessagesAsRead(): Observable<void> {
    return this.http.patch<void>(
      `${getEndpointUrl('user', 'messages')}/read-all`,
      {}
    ).pipe(
      catchError(error => {
        console.error('Error marking all messages as read:', error);
        return throwError(() => error);
      })
    );
  }

  // Delete message
  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(
      `${getEndpointUrl('user', 'messages')}/${messageId}`
    ).pipe(
      catchError(error => {
        console.error('Error deleting message:', error);
        return throwError(() => error);
      })
    );
  }

  // Get notification settings
  getNotificationSettings(): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>(
      getEndpointUrl('user', 'notifications')
    ).pipe(
      catchError(error => {
        console.error('Error fetching notification settings:', error);
        return throwError(() => error);
      })
    );
  }

  // Update notification settings
  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<NotificationSettings> {
    return this.http.put<NotificationSettings>(
      getEndpointUrl('user', 'notifications'),
      settings
    ).pipe(
      catchError(error => {
        console.error('Error updating notification settings:', error);
        return throwError(() => error);
      })
    );
  }

  // Update user profile
  updateProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(
      getEndpointUrl('user', 'profile'),
      profileData
    ).pipe(
      catchError(error => {
        console.error('Error updating profile:', error);
        return throwError(() => error);
      })
    );
  }

  // Upload avatar
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ avatarUrl: string }>(
      `${getEndpointUrl('user', 'profile')}/avatar`,
      formData
    ).pipe(
      catchError(error => {
        console.error('Error uploading avatar:', error);
        return throwError(() => error);
      })
    );
  }

  // Execute message action
  executeMessageAction(messageId: string, action: MessageAction): Observable<any> {
    return this.http.post<any>(
      `${getEndpointUrl('user', 'messages')}/${messageId}/action`,
      { action: action.action, data: action.data }
    ).pipe(
      catchError(error => {
        console.error('Error executing message action:', error);
        return throwError(() => error);
      })
    );
  }
}