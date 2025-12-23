import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { OrgSwitcherComponent } from '../org-switcher/org-switcher.component';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, BottomNavComponent, OrgSwitcherComponent]
})
export class AppShellComponent implements OnInit {
  constructor(private platform: Platform) {}

  async ngOnInit(): Promise<void> {
    await this.platform.ready();
    await this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    try {
      // Set status bar style
      if (this.platform.is('capacitor')) {
        await StatusBar.setStyle({ style: Style.Light });
      }

      // Hide splash screen
      await SplashScreen.hide();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
}
