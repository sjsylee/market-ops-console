import { Controller, Get, Query } from '@nestjs/common';
import type { LoopAccountSelectionKind } from '@market-ops/shared';
import { DemoDataService } from '../services/demo-data.service.js';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly demoData: DemoDataService) {}

  @Get()
  list() { return this.demoData.accountsList(); }

  @Get('overview')
  overview() { return this.demoData.accountOverview(); }

  @Get('selected')
  selected() { return this.demoData.selectedAccount(); }

  @Get('loop-selection')
  selection(@Query('kind') kind: LoopAccountSelectionKind = 'general-loop') { return { item: this.demoData.selection(kind) }; }
}
