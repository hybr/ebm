import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vacancies',
  templateUrl: './vacancies.page.html',
  styleUrls: ['./vacancies.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class VacanciesPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
