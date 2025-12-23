import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-visit',
  templateUrl: './visit.page.html',
  styleUrls: ['./visit.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class VisitPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
