import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { DashboardService } from '../dashboard.service';

import { Dashboard, Chart } from '../dashboard';
import { Tag } from '../tag';


@Component({
  selector: 'app-dashboard-edit',
  templateUrl: './dashboard-edit.component.html',
  styleUrls: ['./dashboard-edit.component.css']
})
export class DashboardEditComponent implements OnInit {

  chartGroupByTypes = [
    {id: "SELF", name: "Self"},
    {id: "DAY", name: "Day"},
    {id: "WEEK", name: "Week"},
    {id: "WEEKEND", name: "Weekend"},
    {id: "MONTH", name: "Month"},
  ];

  chartMetrics = [
    {id: "TAG_PERCENTAGE", name: "Tag duration percentage"},
    {id: "TAG_DURATION", name: "Duration by tag"},
    {id: "METRIC_VALUE", name: "Tag metric value"},
  ];

  @Input()
  dashboard!: Dashboard;

  @Output()
  onDashboardSaved: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
  }

  saveDashboard(): void {
    if(this.dashboard.id) {
      this.dashboardService.updateDashboard(this.dashboard)
        .subscribe(d => {
          this.onDashboardSaved.emit(true);
        });
    } else {
      this.dashboardService.createDashboard(this.dashboard)
        .subscribe(d => {
          this.dashboard.id = d.id;
          this.onDashboardSaved.emit(true);
        });
    }
  }

  addChart(): void {
    let newChart = {
      groupBy: "",
      includedTags: [],
      metric: "",
    };
    this.dashboard.charts.unshift(newChart);
  }

  deleteChart(chart: Chart): void {
    if(confirm('Delete chart?')) {
      this.dashboard.charts = this.dashboard.charts.filter(ch => ch !== chart)
    }
  }

  addTagToChart(chart: Chart, tag: Tag): void {
    chart.includedTags.unshift(tag);
  }

  deleteTagFromChart(chart: Chart, tag: Tag): void {
    chart.includedTags = chart.includedTags.filter(t => t.id !== tag.id);
  }

}
