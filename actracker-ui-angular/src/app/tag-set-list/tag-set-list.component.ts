import { Component, OnInit } from '@angular/core';

import { ActivityService } from '../activity.service';
import { TagService } from '../tag.service';
import { TagSetService } from '../tag-set.service';

import { Activity, MetricValue } from '../activity';
import { Tag } from '../tag';
import { TagSet } from '../tagSet';

@Component({
  selector: 'app-tag-set-list',
  templateUrl: './tag-set-list.component.html',
  styleUrls: ['./tag-set-list.component.css']
})
export class TagSetListComponent implements OnInit {

  nextPageId?: string = undefined;
  tagSets: TagSet[] = [];

  addedTagSets: TagSet[] = [];

  activityToSwitch?: Activity;

  constructor(
    private activityService: ActivityService,
    private tagService: TagService,
    private tagSetService: TagSetService
  ) { }

  ngOnInit(): void {
    this.fetchNextPage();
  }

  fetchNextPage(): void {
    let pageId = this.nextPageId;
    this.nextPageId = undefined;
    this.tagSetService.searchTagSets(undefined, pageId, 10, this.addedTagSets)
          .subscribe(tagSetsResult => {
            let foundTagSets = tagSetsResult.tagSets;
            this.tagSets = this.tagSets.concat(tagSetsResult.tagSets);
            this.nextPageId = tagSetsResult.nextPageId;
          });
  }

  addTagSet(): void {
    let newTagSet: TagSet = {tags: []};
    this.tagSets.unshift(newTagSet);
    this.addedTagSets.unshift(newTagSet);
  }

  prepareActivityToSwitch(tagSet: TagSet): void {
    var metricValues: MetricValue[] | undefined = tagSet.tags
          .flatMap(tag => tag.metrics)
          .filter(metric => !!metric?.id)
          .map(metric => this.activityService.toMetricValue(metric));
    this.activityToSwitch = {
      title: tagSet.name,
      tags: tagSet.tags,
      metricValues: metricValues ?? []
    }
  }

  switchToActivity(activity: Activity): void {
    this.activityService.switchToActivity(activity)
      .subscribe(() => {
        this.activityToSwitch = undefined;
      });
  }

  deleteTagSet(tagSet: TagSet): void {
    if(confirm('Delete tag set?')) {
      if(tagSet.id) {
        this.tagSetService.deleteTagSet(tagSet)
          .subscribe(() => {
            this.tagSets = this.tagSets.filter(tS => tS !== tagSet)
          })
      } else {
        this.tagSets = this.tagSets.filter(tS => tS !== tagSet)
      }
    }
  }

  saveTagSet(tagSet: TagSet): void {
    if(tagSet.id) {
      this.tagSetService.updateTagSet(tagSet)
        .subscribe(a => {
        });
    } else {
      this.tagSetService.createTagSet(tagSet)
        .subscribe(tS => {
          tagSet.id = tS.id
        });
    }
  }
}
