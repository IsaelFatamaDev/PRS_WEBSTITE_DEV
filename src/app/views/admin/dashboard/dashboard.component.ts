import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { OrganizationContextService } from '../../../core/services/organization-context.service';
import { AuthUser } from '../../../core/models/auth.model';
import { UserResponseDTO, StatusUsers, RolesUsers } from '../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  organizationInfo: any = null;
  userStats: {
    total: number;
    active: number;
    clients: number;
    admins: number;
  } = {
      total: 0,
      active: 0,
      clients: 0,
      admins: 0
    };

  isLoading: boolean = true;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private organizationContextService: OrganizationContextService
  ) { }

  ngOnInit(): void {
    this.initializeDashboard();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeDashboard(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadDashboardData();
        }
      })
    );

    this.subscriptions.add(
      this.organizationContextService.organizationContext$.subscribe(context => {
        this.organizationInfo = context;
      })
    );
  }

  private loadDashboardData(): void {
    if (!this.currentUser?.organizationId) {
      console.error('No organization ID found for current user');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.loadUserStats();
  }

  private loadUserStats(): void {
    this.subscriptions.add(
      this.userService.getAllUsers().subscribe({
        next: (users: UserResponseDTO[]) => {
          this.calculateUserStats(users);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user stats:', error);
          this.isLoading = false;
        }
      })
    );
  }

  private calculateUserStats(users: UserResponseDTO[]): void {
    this.userStats = {
      total: users.length,
      active: users.filter(user => user.status === StatusUsers.ACTIVE).length,
      clients: users.filter(user => user.roles.includes(RolesUsers.CLIENT)).length,
      admins: users.filter(user => user.roles.includes(RolesUsers.ADMIN)).length
    };
  }
  getContextInfo() {
    return this.organizationContextService.getContextInfo();
  }

  getUserInitials(): string {
    if (!this.currentUser?.fullName) return 'NA';
    return this.currentUser.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
