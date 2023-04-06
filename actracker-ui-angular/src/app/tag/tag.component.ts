import { Component, OnInit, Input } from '@angular/core';

import { TagService } from '../tag.service';

import { Tag } from '../tag';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.css']
})
export class TagComponent implements OnInit {

  @Input()
  tag!: Tag;
  @Input()
  editMode?: boolean;

  constructor(
    private tagService: TagService
  ) { }

  ngOnInit(): void {
  }

  save() {
    if(!this.tag) {
      return;
    }
    if(this.tag.id) {
      this.tagService.updateTag(this.tag)
        .subscribe(tag => {
        });
    } else {
      this.tagService.createTag(this.tag)
        .subscribe(tag => {
          this.tag.id = tag.id
        });
    }
    this.editMode = false;
  }

  edit() {
    this.editMode = true;
  }

}