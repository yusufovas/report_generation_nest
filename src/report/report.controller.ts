import { Body, Controller, Get, Param, Post, Req, Delete } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportDto } from './dto/report.dto';
import { Request } from 'express';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }
    @Post()
    async createReport(@Body() createReportDto: ReportDto, @Req() req: Request): Promise<any> {
        const hostname = `${req.protocol}://${req.get('Host')}${req.originalUrl}`
        return await this.reportService.createReport(createReportDto, hostname)
    }
    @Get(':id')
    async getReportStatus(@Param('id') id: number, @Req() req: Request) {
        const hostname = `${req.protocol}://${req.get('Host')}`
        return await this.reportService.getReportStatus(id, hostname)
    }
    @Get('download/:id')
    downloadReport(@Param('id') id: number) {
    createWriteStream(join(process.cwd(), 'downloads',`report-${id}.xlsx`))
        return {
            message: 'file downloaded successfully!'
        };
    }
    @Delete('delete/:id')
    removeReport(@Param('id') id:number) {
        return this.reportService.remove(+id)
    }
}
