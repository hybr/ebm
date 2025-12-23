import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-job',
  templateUrl: './job.page.html',
  styleUrls: ['./job.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class JobPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
