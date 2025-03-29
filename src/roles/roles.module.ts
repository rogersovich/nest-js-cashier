import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './roles.entity';
import { BaseRawService } from 'src/raw/base-raw.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RolesService, BaseRawService],
  controllers: [RolesController],
  exports: [TypeOrmModule],
})
export class RolesModule {}
