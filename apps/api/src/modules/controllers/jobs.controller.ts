import { Controller, Get, Param } from '@nestjs/common';
import { DemoDataService } from '../services/demo-data.service.js';

@Controller('jobs')
export class JobsController {
  constructor(private readonly demoData: DemoDataService) {}

  @Get('general-loop/state')
  state() { return this.demoData.generalState(); }

  @Get('general-loop/tasks')
  tasks() { return this.demoData.generalTasksList(); }

  @Get(':kind/logs')
  logs(@Param('kind') _kind: string) { return this.demoData.logsList(); }
}
