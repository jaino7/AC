import { Module } from "@nestjs/common";
import { CreatorsModule } from "./creators/creators.module";
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [CreatorsModule, TransactionsModule]
})
export class AppModule { }
