import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { OrgContextService } from '../../core/services/org-context.service';
import { Organization } from '../../core/models/organization.model';

@Component({
  selector: 'app-org-switcher',
  templateUrl: './org-switcher.component.html',
  styleUrls: ['./org-switcher.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OrgSwitcherComponent implements OnInit {
  activeOrganization$: Observable<Organization | null>;
  userOrganizations$: Observable<Organization[]>;
  showPopover = false;

  constructor(
    private orgContextService: OrgContextService,
    private popoverController: PopoverController
  ) {
    this.activeOrganization$ = this.orgContextService.activeOrganization$;
    this.userOrganizations$ = this.orgContextService.userOrganizations$;
  }

  ngOnInit(): void {}

  async switchOrg(orgId: string): Promise<void> {
    await this.orgContextService.switchOrganization(orgId);
    this.showPopover = false;
  }

  togglePopover(): void {
    this.showPopover = !this.showPopover;
  }
}
