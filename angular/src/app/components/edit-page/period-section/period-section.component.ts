import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResponseService } from '../../../services/response.service';

@Component({
  selector: 'app-period-section',
  templateUrl: './period-section.component.html',
  styleUrls: ['./period-section.component.sass']
})
export class PeriodSectionComponent implements OnInit {
  @Output() onOpenSnackbar = new EventEmitter();
  @Output() onNothingToChange = new EventEmitter();

  @Input() responseService: ResponseService;

  constructor() { }

  ngOnInit() {
  }

}
