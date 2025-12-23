import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-join',
  templateUrl: './join.page.html',
  styleUrls: ['./join.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class JoinPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
