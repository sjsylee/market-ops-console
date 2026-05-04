import { Controller, Get, Query } from '@nestjs/common';
import { DemoDataService } from '../services/demo-data.service.js';

@Controller('current')
export class CurrentController {
  constructor(private readonly demoData: DemoDataService) {}

  @Get('sync/state')
  syncState() { return this.demoData.currentState(); }

  @Get('stats/:accountId')
  stats() { return this.demoData.currentStats(); }

  @Get('items')
  items(@Query('saleOrigin') saleOrigin?: string) { return this.demoData.currentItemsList(saleOrigin); }

  @Get('lowest-loop/state')
  lowestState() { return this.demoData.lowestState(); }

  @Get('lowest-loop/queue')
  lowestQueue() { return this.demoData.lowestQueue(); }
}
