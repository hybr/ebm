import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.page.html',
  styleUrls: ['./organization.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class OrganizationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
