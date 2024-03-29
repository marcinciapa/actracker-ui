import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { TagSetService } from '../tag-set.service';

import { TagSet } from '../tagSet';
import { Tag } from '../tag';

@Component({
  selector: 'app-tag-set-create',
  templateUrl: './tag-set-create.component.html',
  styleUrls: ['./tag-set-create.component.css']
})
export class TagSetCreateComponent implements OnInit {

  @Input()
  tagSet!: TagSet;

  @Output()
  public onTagSetCreated: EventEmitter<TagSet> = new EventEmitter();

  constructor(
    private tagSetService: TagSetService
  ) { }

  ngOnInit(): void {
  }

  create() {
    this.tagSetService.createTagSet(this.tagSet)
      .subscribe(tagSet => {
        this.onTagSetCreated.emit(tagSet);
      });
  }

  addNewTag(tag: Tag): void {
    this.tagSet.tags.unshift(tag);
  }

  deleteTag(tag: Tag): void {
    this.tagSet.tags = this.tagSet.tags.filter(t => t !== tag)
  }

}
