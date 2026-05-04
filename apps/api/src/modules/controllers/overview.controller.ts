import { Controller, Get, Query } from '@nestjs/common';
import type { MacroDetailOverviewKind } from '@market-ops/shared';
import { DemoDataService } from '../services/demo-data.service.js';

@Controller('overview')
export class OverviewController {
  constructor(private readonly demoData: DemoDataService) {}

  @Get('console')
  consoleOverview() { return this.demoData.overview(); }

  @Get('macro-detail')
  macroDetail(@Query('kind') kind: MacroDetailOverviewKind = 'general-loop') { return this.demoData.macroDetail(kind); }
}
