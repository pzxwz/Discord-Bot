const fs = require('fs');

class ReportSystem {
    constructor(filePath = './reports.json') {
        this.filePath = filePath;
        this.reports = this.loadReports();
    }

    
    loadReports() {
        if (fs.existsSync(this.filePath)) {
            return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        }
        return [];
    }

    
    saveReports() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.reports, null, 2));
    }

    
    addReport(reporterId, reportedId, reason) {
        const report = {
            id: this.reports.length + 1,
            reporterId,
            reportedId,
            reason,
            timestamp: new Date().toISOString(),
        };

        this.reports.push(report);
        this.saveReports();
        return report;
    }

    
    getReportById(id) {
        return this.reports.find((report) => report.id === id);
    }
}

module.exports = ReportSystem;
