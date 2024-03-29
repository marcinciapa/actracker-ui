import { Component, OnInit, Input } from '@angular/core';
import { Share } from '../share';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {

  @Input()
  share!: Share;

  constructor() { }

  ngOnInit(): void {
  }

}
