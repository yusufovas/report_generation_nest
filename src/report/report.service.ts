import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { ReportDto } from './dto/report.dto';
import { Workbook } from 'exceljs';
import * as fs from 'fs'
import { join } from 'path';


@Injectable()
export class ReportService {
    private readonly logger = new Logger(ReportService.name);

    constructor(@InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,) { }

    //Create New Report
    async createReport(createReportDto: ReportDto, hostname: string): Promise<object> {
        const report = this.reportRepo.create({
            status: 'pending...'
        })
        const savedReport = await this.reportRepo.save({ ...report, fileUrl: ' ', serviceUrl: hostname })
        this.generateReport(savedReport.id, createReportDto, hostname)
        return {
            status: 'success',
            report_id: savedReport.id
        }
    }

    //Get Report Status
    async getReportStatus(reportId: number, hostname: string): Promise<any> {
        const foundReport = await this.reportRepo.findOne({ where: { id: reportId } })
        if (!foundReport) {
            throw new HttpException(`Report with ID ${reportId} not found`, HttpStatus.NOT_FOUND);
        }

        let downloadUrl: string | undefined;
        if (foundReport.status !== 'completed') {
            downloadUrl = '';
        }
        downloadUrl = `${hostname}/report/download/${reportId}`

        return {
            data: foundReport,
            downloadUrl,
        };
    }

    //Report Generation Service
    async generateReport(reportId: number, createReportDto: ReportDto, hostname: string): Promise<any> {
        this.logger.log(`Starting report generation for task ${reportId}`);
        try {
            const data = await this.getReportStatus(reportId, hostname);
            if (!data) {
                this.logger.error(`No data received for task ${reportId}`);
                return;
            }
            await this.getFile(createReportDto.headers, reportId)
            await this.reportRepo.update(reportId, {
                status: 'completed',
                fileUrl: join(process.cwd(), 'downloads', `report-${reportId}.xlsx`)
            });
            this.logger.log(`Report generated successfully for task ${reportId}`);
        } catch (error) {
            this.logger.error(`Failed to generate report for task ${reportId}: ${error.message}`);
            await this.reportRepo.update(reportId, {
                status: 'failed',
            });
        }

    }
    async getFile(rows: string[], id: number) {
        if(!fs.existsSync(join(process.cwd(), 'downloads'))) {
            fs.mkdir(join(process.cwd(), 'downloads'), (err) => {
                this.logger.log('Error occured while creating a directory')
            })
        }
        const workbook = new Workbook()
        const worksheet = workbook.addWorksheet('Report')
        worksheet.addRow(rows)
        return await workbook.xlsx.writeFile(join(process.cwd(), 'downloads',`report-${id}.xlsx`))

    }

    async remove(reportId: number) {
        const report = await this.reportRepo.findOne({ where: { id: reportId } })
        if(!report) return new HttpException('Report with this ID not found', HttpStatus.NOT_FOUND)
        await this.reportRepo.remove(report)
        return 
    }
}
