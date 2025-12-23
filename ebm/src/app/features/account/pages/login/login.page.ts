import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  async login() {
    if (!this.email || !this.password) {
      await this.showToast('Please enter email and password', 'warning');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: async () => {
        await this.showToast('Login successful!', 'success');

        // Redirect to return URL or home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      },
      error: async (error) => {
        console.error('Login error:', error);
        await this.showToast('Invalid email or password', 'danger');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }
}
