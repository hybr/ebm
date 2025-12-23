import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BottomNavService } from './bottom-nav.service';
import { NavNode, NavigationStack } from '../../core/models/nav-node.model';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class BottomNavComponent implements OnInit, OnDestroy {
  navItems: NavNode[] = [];
  navigationStack: NavigationStack | null = null;
  showBackButton = false;

  private destroy$ = new Subject<void>();

  constructor(private bottomNavService: BottomNavService) {}

  ngOnInit(): void {
    // Subscribe to visible nav items
    this.bottomNavService.visibleNavItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.navItems = items;
      });

    // Subscribe to navigation stack
    this.bottomNavService.navigationStack$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stack => {
        this.navigationStack = stack;
        this.showBackButton = (stack?.depth ?? 0) > 1;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNavItemClick(item: NavNode): void {
    this.bottomNavService.push(item);
  }

  onBackClick(): void {
    this.bottomNavService.pop();
  }

  isActive(item: NavNode): boolean {
    return this.navigationStack?.currentNode?.id === item.id;
  }
}
