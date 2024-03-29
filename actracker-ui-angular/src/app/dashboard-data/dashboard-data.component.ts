import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { DashboardDataService } from '../dashboard-data.service';
import { DashboardService } from '../dashboard.service';
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

  dashboard?: Dashboard;

  dashboardData?: DashboardData;

  activityFilter: ActivityFilter = {tags: []};

  constructor(
    private dashboardService: DashboardService,
    private dashboardDataService: DashboardDataService,
    private tagService: TagService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    let id: string | null = this.route.snapshot.queryParamMap.get('id');
    if(id) {
      this.dashboardService.getDashboard(id)
        .subscribe(d => {
          this.dashboard = d;
          this.reload();
        });
    } else {
      console.error('Dashboard ID must be provided as query param');
    }
  }

  reload(): void {
    this.dashboardDataService.getDashboardData(this.dashboard!, this.activityFilter.dateRangeStart, this.activityFilter.dateRangeEnd, this.activityFilter.tags)
      .subscribe(data => {
        this.dashboardData = data;
        this.resolveBucketNames();
      });
  }

  private resolveBucketNames(): void {
    let buckets: BucketData[] = this.dashboardData!.charts
      .flatMap(ch => ch.buckets);
    let tagBuckets = this.getBucketsOfTypeRecursively('TAG', buckets);
    this.resolveTagBucketNames(tagBuckets);
    let metricBuckets = this.getBucketsOfTypeRecursively('METRIC', buckets);
    this.resolveMetricBucketNames(metricBuckets);
    let dayBuckets = this.getBucketsOfTypeRecursively('DAY', buckets);
    this.resolveTimeRangeBucketNames(dayBuckets);
    let weekBuckets = this.getBucketsOfTypeRecursively('WEEK', buckets);
    this.resolveTimeRangeBucketNames(weekBuckets);
    let weekendBuckets = this.getBucketsOfTypeRecursively('WEEKEND', buckets);
        this.resolveTimeRangeBucketNames(weekendBuckets);
    let monthBuckets = this.getBucketsOfTypeRecursively('MONTH', buckets);
    this.resolveTimeRangeBucketNames(monthBuckets);
  }

  private getBucketsOfTypeRecursively(bucketType: string, buckets?: BucketData[]): BucketData[] {
    let matchingBuckets: BucketData[] = this.getBucketsOfType(bucketType, buckets);
    buckets?.forEach(bucket => {
      let subBuckets: BucketData[] | undefined = bucket.buckets;
      matchingBuckets = matchingBuckets.concat(this.getBucketsOfType(bucketType, subBuckets));
    });

    return matchingBuckets;
  }

  private getBucketsOfType(bucketType: string, buckets?: BucketData[]): BucketData[] {
    return buckets?.filter(bucket => bucket.bucketType == bucketType) ?? [];
  }

  private resolveMetricBucketNames(metricBuckets: BucketData[]): void {
    metricBuckets.forEach(bucket => {
      bucket.label = bucket.id;
    });
  }

  private resolveTagBucketNames(tagBuckets: BucketData[]): void {
    let tagBucketIds: string[] = tagBuckets
      .filter(b => !!b.id)
      .map(b => b.id!);
    this.tagService.resolveTags(tagBucketIds)
      .subscribe(tagsResult => {
        tagBuckets.forEach(bucket => {
          let matchingTag: Tag | undefined = tagsResult.tags.find(tag => tag.id == bucket.id);
          bucket.label = matchingTag?.name ?? bucket.id;
        });
      });
  }

  private resolveTimeRangeBucketNames(timeRangeBuckets: BucketData[]): void {
    timeRangeBuckets.forEach(bucket => {
      bucket.label = `${bucket.rangeStart?.toLocaleString()} - ${bucket.rangeEnd?.toLocaleString()}`;
    });
  }

  drillDown(buckets: BucketData[]): void {
    let tagBuckets: BucketData[] = this.getBucketsOfType('TAG', buckets);
    let timeRangeBuckets: BucketData[] = this.getBucketsOfType('DAY', buckets);
    timeRangeBuckets = timeRangeBuckets.concat(this.getBucketsOfType('WEEK', buckets));
    timeRangeBuckets = timeRangeBuckets.concat(this.getBucketsOfType('WEEKEND', buckets));
    timeRangeBuckets = timeRangeBuckets.concat(this.getBucketsOfType('MONTH', buckets));

    let tags: Tag[] = tagBuckets
      .filter(bucket => !!bucket.id)
      .map(bucket => <Tag>{id: bucket.id});

    let rangeStarts: Date[] = timeRangeBuckets
      .filter(bucket => !!bucket.rangeStart)
      .map(bucket => bucket.rangeStart!)

    if(this.activityFilter.dateRangeStart) {
      rangeStarts.unshift(this.activityFilter.dateRangeStart);
    }

    let latestRangeStart: Date | undefined = rangeStarts?.length > 0
      ? rangeStarts.reduce((date1, date2) => date1! > date2! ? date1 : date2)
      : undefined;

    let rangeEnds: Date[] = timeRangeBuckets
      .filter(bucket => !!bucket.rangeEnd)
      .map(bucket => bucket.rangeEnd!)

    if(this.activityFilter.dateRangeEnd) {
      rangeEnds.unshift(this.activityFilter.dateRangeEnd);
    }

    let earliestRangeEnd: Date | undefined = rangeEnds?.length > 0
      ? rangeEnds.reduce((date1, date2) => date1! < date2! ? date1 : date2)
      : undefined;

    let optionalParams = {
      tags: tags.length > 0 ? tags.map(tag => tag.id).join(',') : '',
      rangeStart: latestRangeStart?.getTime() ?? '',
      rangeEnd: earliestRangeEnd?.getTime() ?? ''
    }

    this.router.navigate(['/activities', optionalParams]);
  }

}
