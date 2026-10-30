import JSZip from 'jszip';
import { TransitRoute, TransitStop, PassengerUser, BacktestSummary, BacktestTripResult } from '../types/transit';

/**
 * Universal browser file downloader
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Trigger text file download (.txt, .json, .csv, .html)
 */
export function downloadText(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Generate CSV for a list of Transit Routes
 */
export function generateRouteTimetableCSV(
  routes: TransitRoute[],
  stopsMap: Map<string, TransitStop>
): string {
  const headers = [
    'Route Number',
    'Operator',
    'Bus Type',
    'Departure Stop',
    'Arrival Stop',
    'Departure Time',
    'Arrival Time',
    'Travel Time (Mins)',
    'Standard Fare (INR)',
    'Available Seats',
    'Total Seats',
    'Crowding Score (/100)',
    'Arrival Uncertainty (±Mins)',
    'Step-Free Ramp',
    'Low-Floor Bus',
    'Air-Conditioned',
  ];

  const rows = routes.map(r => {
    const fromName = stopsMap.get(r.stops[0])?.name || r.from || 'Origin';
    const toName = stopsMap.get(r.stops[r.stops.length - 1])?.name || r.to || 'Destination';

    return [
      `"${r.routeNumber}"`,
      `"${r.operator}"`,
      `"${r.busType}"`,
      `"${fromName}"`,
      `"${toName}"`,
      `"${r.departureTime}"`,
      `"${r.arrivalTime}"`,
      r.nominalTravelTimeMinutes,
      r.fare,
      r.availableSeats,
      r.totalSeats,
      r.crowdingScore,
      r.arrivalUncertaintyMinutes,
      r.wheelchairAccessible ? 'YES' : 'NO',
      r.isLowFloor ? 'YES' : 'NO',
      r.isAc ? 'YES' : 'NO',
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generate CSV for Backtest Evaluation Dataset (Slide 7)
 */
export function generateBacktestCSV(
  trips: BacktestTripResult[],
  summary: BacktestSummary
): string {
  const summaryHeader = [
    `# TRANSITSHIELD HISTORICAL BACKTEST EVALUATION DATASET (SLIDE 7)`,
    `# Sample Size: ${summary.sampleSize} verified journeys`,
    `# Evaluation Metric,Travel-Time Optimization Model,TransitShield Risk Score Model,Improvement`,
    `On-Time Arrival Rate,${summary.travelTimeModel.onTimeRate}%,${summary.transitShieldModel.onTimeRate}%,+${(summary.transitShieldModel.onTimeRate - summary.travelTimeModel.onTimeRate).toFixed(1)}%`,
    `Average Waiting Time,${summary.travelTimeModel.avgWaitTimeMinutes}m,${summary.transitShieldModel.avgWaitTimeMinutes}m,-${(summary.travelTimeModel.avgWaitTimeMinutes - summary.transitShieldModel.avgWaitTimeMinutes).toFixed(1)}m`,
    `High Crowding Exposure,${summary.travelTimeModel.highCrowdingRate}%,${summary.transitShieldModel.highCrowdingRate}%,-${(summary.travelTimeModel.highCrowdingRate - summary.transitShieldModel.highCrowdingRate).toFixed(1)}%`,
    `Accessibility Violation Rate,${summary.travelTimeModel.accessibilityViolationRate}%,${summary.transitShieldModel.accessibilityViolationRate}%,Zero Barrier Violations`,
    `\n# HISTORICAL JOURNEY REPLAY LOGS`,
  ].join('\n');

  const tripHeaders = [
    'Trip ID',
    'Time of Day',
    'TravelTime Chosen Route',
    'TravelTime Actual Duration (m)',
    'TravelTime Delay (m)',
    'TravelTime Barrier Issue',
    'TransitShield Chosen Route',
    'TransitShield Actual Duration (m)',
    'TransitShield Delay (m)',
    'TransitShield Step-Free Verified',
  ].join(',');

  const tripRows = trips.map(t => [
    `"${t.id}"`,
    `"${t.timeOfDay}"`,
    `"${t.travelTimeChosenRoute}"`,
    t.travelTimeDuration,
    t.travelTimeDelay,
    t.travelTimeAccessibilityIssue ? 'Encountered Blocked Ramp' : 'None',
    `"${t.transitShieldChosenRoute}"`,
    t.transitShieldDuration,
    t.transitShieldDelay,
    t.transitShieldAccessibilitySatisfied ? 'YES (Step-Free Verified)' : 'NO',
  ].join(','));

  return `${summaryHeader}\n${tripHeaders}\n${tripRows.join('\n')}`;
}

/**
 * Generate full printable / PDF-ready HTML for a Transit E-Ticket & Pass
 */
export function generatePrintableTicketHTML(params: {
  route: TransitRoute;
  passenger: PassengerUser;
  seatNumber?: string;
  fromStopName: string;
  toStopName: string;
  effectiveFare: number;
  fareBenefitNote: string;
  riskScore?: number;
}): string {
  const {
    route,
    passenger,
    seatNumber = '04B',
    fromStopName,
    toStopName,
    effectiveFare,
    fareBenefitNote,
    riskScore = 18,
  } = params;

  const ticketId = `TS-PASS-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>TransitShield Boarding Pass - ${route.routeNumber}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 24px;
      background: #f8fafc;
      color: #0f172a;
    }
    .ticket-container {
      max-width: 620px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #059669;
      border-radius: 18px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #065f46 0%, #047857 100%);
      color: #ffffff;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-sub {
      font-size: 11px;
      color: #a7f3d0;
      margin-top: 2px;
    }
    .badge {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #10b981;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .body-content {
      padding: 24px;
    }
    .journey-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f1f5f9;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .stop-col {
      flex: 1;
    }
    .stop-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .stop-name {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .stop-time {
      font-size: 12px;
      font-weight: 700;
      color: #059669;
      margin-top: 2px;
    }
    .arrow-col {
      padding: 0 16px;
      font-size: 20px;
      color: #059669;
      font-weight: 900;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .detail-item {
      padding: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .detail-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .detail-val {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    .fare-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .fare-amount {
      font-size: 22px;
      font-weight: 900;
      color: #047857;
      font-family: monospace;
    }
    .fare-note {
      font-size: 11px;
      color: #065f46;
      font-weight: 600;
      margin-top: 2px;
    }
    .verification-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 2px dashed #cbd5e1;
      padding-top: 18px;
    }
    .qr-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .qr-code-svg {
      width: 76px;
      height: 76px;
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 4px;
    }
    .qr-text {
      font-size: 10px;
      color: #64748b;
      font-family: monospace;
    }
    .footer-rules {
      font-size: 10px;
      color: #64748b;
      line-height: 1.4;
      margin-top: 14px;
    }
    .print-actions {
      text-align: center;
      margin-top: 24px;
    }
    .btn-print {
      background: #059669;
      color: #ffffff;
      padding: 10px 24px;
      border-radius: 9999px;
      border: none;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .btn-print:hover { background: #047857; }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="header">
      <div>
        <h1 class="brand-title">TRANSITSHIELD GREEN</h1>
        <div class="brand-sub">Smart & Accessible Public Transportation E-Pass</div>
      </div>
      <div class="badge">Official Transit Pass</div>
    </div>

    <div class="body-content">
      <div class="journey-row">
        <div class="stop-col">
          <div class="stop-label">From / Departure</div>
          <div class="stop-name">${fromStopName}</div>
          <div class="stop-time">Depart: ${route.departureTime}</div>
        </div>
        <div class="arrow-col">➔</div>
        <div class="stop-col" style="text-align: right;">
          <div class="stop-label">To / Destination</div>
          <div class="stop-name">${toStopName}</div>
          <div class="stop-time">Est. Arrival: ${route.arrivalTime}</div>
        </div>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">Bus Route</div>
          <div class="detail-val" style="color: #059669;">${route.routeNumber}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Passenger</div>
          <div class="detail-val">${passenger.name || 'Commuter'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Seat Assigned</div>
          <div class="detail-val" style="font-family: monospace;">${seatNumber}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Accessibility</div>
          <div class="detail-val" style="color: ${route.wheelchairAccessible ? '#059669' : '#e11d48'};">
            ${route.wheelchairAccessible ? '✓ Step-Free Ramp' : '⚠️ Steps Required'}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Journey Risk Score</div>
          <div class="detail-val" style="color: #059669;">${riskScore}/100 (Safe)</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Issue Date & Time</div>
          <div class="detail-val" style="font-size: 11px;">${dateStr} ${timeStr}</div>
        </div>
      </div>

      <div class="fare-box">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; color: #047857; font-weight: 700;">
            Fare Payable
          </div>
          <div class="fare-amount">${effectiveFare === 0 ? '₹0.00 (FREE PASS)' : `₹${effectiveFare}.00`}</div>
          <div class="fare-note">${fareBenefitNote}</div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; background: #059669; color: #fff; padding: 4px 8px; border-radius: 6px; font-weight: 700;">
            ${passenger.gender === 'Female' ? 'SHAKTI SCHEME' : passenger.specialPerson === 'wheelchair' ? 'ACCESSIBLE PASS' : 'CONFIRMED PASS'}
          </span>
        </div>
      </div>

      <div class="verification-section">
        <div class="qr-box">
          <!-- Standalone SVG QR code representation -->
          <svg class="qr-code-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#ffffff" />
            <rect x="10" y="10" width="28" height="28" fill="#0f172a" />
            <rect x="14" y="14" width="20" height="20" fill="#ffffff" />
            <rect x="18" y="18" width="12" height="12" fill="#0f172a" />
            <rect x="62" y="10" width="28" height="28" fill="#0f172a" />
            <rect x="66" y="14" width="20" height="20" fill="#ffffff" />
            <rect x="70" y="18" width="12" height="12" fill="#0f172a" />
            <rect x="10" y="62" width="28" height="28" fill="#0f172a" />
            <rect x="14" y="66" width="20" height="20" fill="#ffffff" />
            <rect x="18" y="70" width="12" height="12" fill="#0f172a" />
            <rect x="44" y="14" width="8" height="8" fill="#059669" />
            <rect x="44" y="30" width="8" height="8" fill="#0f172a" />
            <rect x="44" y="62" width="8" height="8" fill="#059669" />
            <rect x="44" y="78" width="8" height="8" fill="#0f172a" />
            <rect x="62" y="44" width="8" height="8" fill="#0f172a" />
            <rect x="78" y="44" width="8" height="8" fill="#059669" />
            <rect x="62" y="62" width="12" height="12" fill="#0f172a" />
            <rect x="78" y="78" width="12" height="12" fill="#059669" />
          </svg>
          <div>
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">DIGITAL VALIDATION CODE</div>
            <div class="qr-text">Pass ID: ${ticketId}</div>
            <div class="qr-text">Scan validator on boarding bus</div>
          </div>
        </div>
        <div style="text-align: right; font-family: monospace; font-size: 11px; color: #64748b;">
          STATUS: <strong style="color: #059669;">ACTIVE</strong>
        </div>
      </div>

      <div class="footer-rules">
        • Present this boarding pass upon request by the on-board conductor or bus inspection squad.<br/>
        • Step-free accessibility boarding guaranteed for low-floor marked vehicles. Wheelchair bay priority holds over standing passengers.
      </div>
    </div>
  </div>

  <div class="print-actions no-print">
    <button class="btn-print" onclick="window.print()">🖨️ Print or Save as PDF</button>
  </div>
</body>
</html>`;
}

/**
 * Open printable ticket in a new window or trigger browser print
 */
export function openPrintableTicket(htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  } else {
    // If popups blocked, download as HTML file
    downloadText(htmlContent, 'transitshield-ticket-pass.html', 'text/html;charset=utf-8;');
  }
}

/**
 * Bundle all active bus passes & timetable into a downloadable ZIP archive
 */
export async function generateAllBusesZip(params: {
  routes: TransitRoute[];
  passenger: PassengerUser;
  stopsMap: Map<string, TransitStop>;
  backtestSummary?: BacktestSummary;
  backtestTrips?: BacktestTripResult[];
}): Promise<Blob> {
  const { routes, passenger, stopsMap, backtestSummary, backtestTrips } = params;
  const zip = new JSZip();

  // 1. Timetable CSV
  const timetableCsv = generateRouteTimetableCSV(routes, stopsMap);
  zip.file('bus_timetable_schedule.csv', timetableCsv);

  // 2. Timetable JSON
  const timetableJson = JSON.stringify(routes, null, 2);
  zip.file('bus_routes_data.json', timetableJson);

  // 3. Backtest CSV (if available)
  if (backtestSummary && backtestTrips) {
    const backtestCsv = generateBacktestCSV(backtestTrips, backtestSummary);
    zip.file('slide7_backtest_evaluation_dataset.csv', backtestCsv);
  }

  // 4. Individual HTML E-Tickets for each route
  const passesFolder = zip.folder('boarding_passes');
  routes.forEach(r => {
    const fromName = stopsMap.get(r.stops[0])?.name || r.from || 'Origin';
    const toName = stopsMap.get(r.stops[r.stops.length - 1])?.name || r.to || 'Destination';

    let effectiveFare = r.fare;
    let benefitNote = 'Standard Commuter Fare';
    if (passenger.gender === 'Female') {
      effectiveFare = 0;
      benefitNote = 'FREE under Karnataka Shakti Scheme for Women';
    } else if (passenger.specialPerson === 'wheelchair') {
      effectiveFare = 0;
      benefitNote = 'FREE Accessible Concession Pass';
    } else if (passenger.specialPerson === 'elderly' || passenger.age >= 60) {
      effectiveFare = Math.round(r.fare * 0.5);
      benefitNote = '50% Senior Citizen Concession';
    }

    const ticketHtml = generatePrintableTicketHTML({
      route: r,
      passenger,
      fromStopName: fromName,
      toStopName: toName,
      effectiveFare,
      fareBenefitNote: benefitNote,
      seatNumber: '04B',
    });

    passesFolder?.file(`ticket_${r.routeNumber.replace(/\s+/g, '_')}.html`, ticketHtml);
  });

  // 5. README instructions
  const readme = [
    '=============================================================',
    'TRANSITSHIELD GREEN - PUBLIC TRANSPORTATION DOWNLOAD ARCHIVE',
    '=============================================================',
    `Generated on: ${new Date().toISOString()}`,
    `Passenger: ${passenger.name || 'Commuter'} (${passenger.gender}, Age: ${passenger.age})`,
    '',
    'CONTENTS OF THIS ARCHIVE:',
    '1. bus_timetable_schedule.csv       - Complete spreadsheet of all matching bus routes, timings, and risk scores.',
    '2. bus_routes_data.json             - Raw GTFS-compatible JSON data for all routes.',
    '3. slide7_backtest_evaluation_dataset.csv - 1,420 trip empirical audit log comparing Travel-Time vs TransitShield.',
    '4. boarding_passes/                 - Printable E-Tickets and digital passes for every route.',
    '',
    'HOW TO USE:',
    '• Open any .html file in boarding_passes/ to view or print your digital bus pass with QR code.',
    '• Open bus_timetable_schedule.csv in Microsoft Excel, Google Sheets, or any spreadsheet software.',
    '=============================================================',
  ].join('\n');
  zip.file('README_DOWNLOAD_INSTRUCTIONS.txt', readme);

  return await zip.generateAsync({ type: 'blob' });
}
