import { Component, OnInit } from '@angular/core';

import { DashboardService } from '../dashboard.service';

import { Dashboard } from '../dashboard';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.css']
})
export class DashboardListComponent implements OnInit {

  nextPageId?: string = undefined;
  dashboards: Dashboard[] = [];

  addedDashboards: Dashboard[] = [];

  dashboardToAdd?: Dashboard;

  constructor(
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.fetchNextPage();
  }

  initDashboardCreate() {
    this.dashboardToAdd = {charts: [], shares: []};
  }

  fetchNextPage(): void {
    let pageId = this.nextPageId;
    this.nextPageId = undefined;
    this.dashboardService.searchDashboards(undefined, pageId, 10, this.addedDashboards)
          .subscribe(dashboardsResult => {
            let foundDashboards = dashboardsResult.dashboards;
            this.dashboards = this.dashboards.concat(dashboardsResult.dashboards);
            this.nextPageId = dashboardsResult.nextPageId;
          });
  }

  deleteDashboard(dashboard: Dashboard): void {
    if(dashboard.id) {
      if(confirm('Delete dashboard?')) {
        this.dashboardService.deleteDashboard(dashboard)
          .subscribe(() => {
            this.dashboards = this.dashboards.filter(d => d !== dashboard)
          });
      }
    } else {
      this.dashboards = this.dashboards.filter(d => d !== dashboard)
    }
  }

  addDashboard(dashboard: Dashboard) {
    this.dashboards.unshift(dashboard);
    this.addedDashboards.unshift(dashboard);
    this.dashboardToAdd = undefined;
  }
}
