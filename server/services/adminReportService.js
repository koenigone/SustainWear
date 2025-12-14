const db = require("../config/db");
const { getDateRange } = require("../helpers/getReportRange");

function generateReportData(
  range,
  start,
  end,
  includeAudit = true,
  includeOrgs = true
) {
  return new Promise((resolve, reject) => {
    let dateRange;

    try {
      dateRange = getDateRange(range, start, end);
    } catch (err) {
      return reject(err);
    }

    const { start: startDate, end: endDate } = dateRange;

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const report = {
      summary: {},
      distributions: {},
      donationFunnel: {},
      trends: [],
      organisations: [],
      userActivity: { staff: [], donors: [] },
      auditSummary: [],
      dateRange: { start: startISO, end: endISO },
    };

    const q = {
      summary: `
        SELECT
          COUNT(*) AS total_submitted,
          SUM(CASE WHEN status='Accepted' THEN 1 ELSE 0 END) AS accepted,
          SUM(CASE WHEN status='Declined' THEN 1 ELSE 0 END) AS declined
        FROM DONATION_TRANSACTION
        WHERE submitted_at BETWEEN ? AND ?
      `,
      distributions: `
        SELECT 
          COUNT(*) AS distributed,
          SUM(co2_saved) AS co2,
          SUM(landfill_saved) AS landfill,
          SUM(beneficiaries) AS beneficiaries
        FROM DISTRIBUTION_RECORD
        WHERE distributed_at BETWEEN ? AND ?
      `,
      funnel: `
        SELECT
          COUNT(*) AS submitted,
          SUM(CASE WHEN handled_at IS NOT NULL THEN 1 ELSE 0 END) AS reviewed,
          SUM(CASE WHEN status='Accepted' THEN 1 ELSE 0 END) AS accepted,
          (
            SELECT COUNT(*) 
            FROM DISTRIBUTION_RECORD 
            WHERE distributed_at BETWEEN ? AND ?
          ) AS distributed
        FROM DONATION_TRANSACTION
        WHERE submitted_at BETWEEN ? AND ?
      `,
      trends: `
        SELECT 
          strftime('%Y-%m', submitted_at) AS month,
          COUNT(*) AS submissions
        FROM DONATION_TRANSACTION
        WHERE submitted_at BETWEEN ? AND ?
        GROUP BY month
        ORDER BY month ASC
      `,
      orgPerformance: `
        SELECT 
          o.name,
          o.org_id,
          COUNT(dt.transaction_id) AS received,
          SUM(CASE WHEN dt.status='Accepted' THEN 1 ELSE 0 END) AS accepted,
          COUNT(dr.distribution_id) AS distributed,
          SUM(dr.co2_saved) AS co2,
          SUM(dr.beneficiaries) AS beneficiaries
        FROM ORGANISATION o
        LEFT JOIN DONATION_TRANSACTION dt ON o.org_id = dt.org_id
        LEFT JOIN DISTRIBUTION_RECORD dr ON o.org_id = dr.org_id
        WHERE dt.submitted_at BETWEEN ? AND ?
        GROUP BY o.org_id
        ORDER BY received DESC
      `,
      staffActivity: `
        SELECT 
          u.first_name || ' ' || u.last_name AS staff_name,
          COUNT(*) AS handled
        FROM DONATION_TRANSACTION dt
        LEFT JOIN USER u ON dt.handled_by_staff_id = u.user_id
        WHERE dt.handled_at BETWEEN ? AND ?
        GROUP BY dt.handled_by_staff_id
        ORDER BY handled DESC
      `,
      donorActivity: `
        SELECT 
          u.first_name || ' ' || u.last_name AS donor_name,
          COUNT(*) AS donations
        FROM DONATION_TRANSACTION dt
        LEFT JOIN USER u ON dt.donor_id = u.user_id
        WHERE dt.submitted_at BETWEEN ? AND ?
        GROUP BY dt.donor_id
        ORDER BY donations DESC
      `,
      auditSummary: `
        SELECT 
          action_category,
          action_type,
          COUNT(*) AS count
        FROM ADMIN_LOG
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY action_category, action_type
      `,
    };

    // START QUERY PIPELINE
    db.get(q.summary, [startISO, endISO], (err, row) => {
      if (err) return reject(err);
      report.summary = row;

      db.get(q.distributions, [startISO, endISO], (err, row2) => {
        if (err) return reject(err);
        report.distributions = row2;

        db.get(q.funnel, [startISO, endISO, startISO, endISO], (err, row3) => {
          if (err) return reject(err);
          report.donationFunnel = row3;

          db.all(q.trends, [startISO, endISO], (err, trends) => {
            if (err) return reject(err);
            report.trends = trends;

            db.all(q.staffActivity, [startISO, endISO], (err, staff) => {
              if (err) return reject(err);
              report.userActivity.staff = staff;

              db.all(q.donorActivity, [startISO, endISO], (err, donors) => {
                if (err) return reject(err);
                report.userActivity.donors = donors;

                if (includeOrgs) {
                  db.all(q.orgPerformance, [startISO, endISO], (err, orgs) => {
                    if (err) return reject(err);
                    report.organisations = orgs;

                    if (includeAudit) {
                      db.all(
                        q.auditSummary,
                        [startISO, endISO],
                        (err, audit) => {
                          if (err) return reject(err);
                          report.auditSummary = audit;
                          resolve(report);
                        }
                      );
                    } else {
                      resolve(report);
                    }
                  });
                } else {
                  if (includeAudit) {
                    db.all(q.auditSummary, [startISO, endISO], (err, audit) => {
                      if (err) return reject(err);
                      report.auditSummary = audit;
                      resolve(report);
                    });
                  } else {
                    resolve(report);
                  }
                }
              });
            });
          });
        });
      });
    });
  });
}

module.exports = { generateReportData };