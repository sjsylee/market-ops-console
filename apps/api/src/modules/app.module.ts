import { Module } from '@nestjs/common';

import { AccountsController } from './controllers/accounts.controller.js';
import { CurrentController } from './controllers/current.controller.js';
import { JobsController } from './controllers/jobs.controller.js';
import { OverviewController } from './controllers/overview.controller.js';
import { DemoDataService } from './services/demo-data.service.js';

@Module({
  controllers: [AccountsController, CurrentController, JobsController, OverviewController],
  providers: [DemoDataService],
})
export class AppModule {}
