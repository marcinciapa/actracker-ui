import { Component, OnInit, Input } from '@angular/core';

import { DashboardDataService } from '../dashboard-data.service';
import { TagService } from '../tag.service';

import { Dashboard } from '../dashboard';
import { DashboardData, BucketData } from '../dashboardData';
import { Tag } from '../tag';
import { ActivityFilter } from '../activityFilter';

@Component({
  selector: 'app-dashboard-data',
  templateUrl: './dashboard-data.component.html',
  styleUrls: ['./dashboard-data.component.css']
})
export class DashboardDataComponent implements OnInit {

  @Input()
  dashboard!: Dashboard;

  dashboardData?: DashboardData;

  activityFilter: ActivityFilter = {tags: []};

  constructor(
    private dashboardDataService: DashboardDataService,
    private tagService: TagService
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.dashboardDataService.getDashboardData(this.dashboard, this.activityFilter.dateRangeStart, this.activityFilter.dateRangeEnd, this.activityFilter.tags)
      .subscribe(data => {
        this.dashboardData = data;
        this.resolveBucketNames();
      });
  }

  private resolveBucketNames(): void {
    let buckets: BucketData[] = this.dashboardData!.charts
      .flatMap(ch => ch.buckets);
    let tagBuckets = this.getBucketsOfType('TAG', buckets);
    this.resolveTagBucketNames(tagBuckets);
    let dayBuckets = this.getBucketsOfType('DAY', buckets);
    this.resolveDayBucketNames(dayBuckets);
  }

  private getBucketsOfType(type: string, buckets?: BucketData[]): BucketData[] {
    let matchingBuckets: BucketData[] = buckets?.filter(bucket => bucket.type == type) ?? [];
    buckets?.forEach(bucket => {
      let subBuckets: BucketData[] | undefined = bucket.buckets;
      matchingBuckets = matchingBuckets.concat(this.getBucketsOfType(type, subBuckets));
    });

    return matchingBuckets;
  }

  private resolveTagBucketNames(tagBuckets: BucketData[]): void {
    let tagBucketNames: string[] = tagBuckets.map(b => b.name);
    this.tagService.resolveTags(tagBucketNames)
      .subscribe(tagsResult => {
        tagBuckets.forEach(bucket => {
          let matchingTag: Tag | undefined = tagsResult.tags.find(tag => tag.id == bucket.name);
          bucket.name = matchingTag?.name?? bucket.name;
        });
      });
  }

  private resolveDayBucketNames(dayBuckets: BucketData[]): void {
    dayBuckets.forEach(bucket => {
      let epochMillis: number = +bucket.name;
      let date: Date = new Date(epochMillis);
      bucket.name = date.toLocaleString();
    });
  }

}
