import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_STOPS,
  INITIAL_ROUTES,
  BUSY_TIMES_DATA,
  INITIAL_REPORTS,
  INITIAL_BACKTEST_SUMMARY,
  INITIAL_BACKTEST_TRIPS,
  INITIAL_ETM_TICKETS,
  INITIAL_ROUTE_SEATS,
  INITIAL_ETM_GPS_FLEET,
} from './src/data/transitData.ts';
import {
  CommunityReport,
  TransitStop,
  TransitRoute,
  ETMTicket,
  ETMSeat,
  ETMGpsTelemetry,
} from './src/types/transit.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent state (simulating real-time transit & GTFS-R engine)
let stops: TransitStop[] = JSON.parse(JSON.stringify(INITIAL_STOPS));
let routes: TransitRoute[] = JSON.parse(JSON.stringify(INITIAL_ROUTES));
let reports: CommunityReport[] = JSON.parse(JSON.stringify(INITIAL_REPORTS));
let etmTickets: ETMTicket[] = JSON.parse(JSON.stringify(INITIAL_ETM_TICKETS));
let routeSeats: Record<string, ETMSeat[]> = JSON.parse(JSON.stringify(INITIAL_ROUTE_SEATS));
let gpsFleet: ETMGpsTelemetry[] = JSON.parse(JSON.stringify(INITIAL_ETM_GPS_FLEET));

// Helper: Prune community reports older than 60 minutes (Slide 4 requirement)
function cleanExpiredReports() {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  reports = reports.filter(r => (now - r.reportedAt) < ONE_HOUR);
}

// Gemini AI client initialization
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const aiClient = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// API: Get complete network state
app.get('/api/network', (_req: Request, res: Response) => {
  cleanExpiredReports();
  res.json({
    stops,
    routes,
    busyTimes: BUSY_TIMES_DATA,
    reports,
    backtestSummary: INITIAL_BACKTEST_SUMMARY,
    serverTime: new Date().toISOString(),
  });
});

// API: Submit Community Report (Slide 3 & 4)
app.post('/api/reports', (req: Request, res: Response) => {
  try {
    const { stopId, routeId, category, notes, crowdingState, hasArrived } = req.body;
    if (!stopId || !category) {
      res.status(400).json({ error: 'stopId and category are required' });
      return;
    }

    const targetStop = stops.find(s => s.id === stopId);
    const targetRoute = routes.find(r => r.id === routeId);

    const now = Date.now();
    const newReport: CommunityReport = {
      id: `rep-${now.toString().slice(-6)}`,
      stopId,
      stopName: targetStop ? targetStop.name : stopId,
      routeId: targetRoute ? targetRoute.id : undefined,
      routeNumber: targetRoute ? targetRoute.routeNumber : undefined,
      category,
      crowdingState,
      hasArrived,
      notes: notes || `Community report filed for ${targetStop?.name || stopId}`,
      reportedAt: now,
      expiresAt: now + (60 * 60 * 1000), // Exactly 60 mins
      upvotes: 1,
    };

    reports.unshift(newReport);
    cleanExpiredReports();

    // Dynamically adjust stop accessibility if barrier or blocked path reported
    if (targetStop) {
      if (category === 'blocked_path') {
        targetStop.accessibility.status = 'blocked_path';
        targetStop.accessibility.details = notes || 'Commuter reported blocked walkway / construction obstruction.';
      } else if (category === 'broken_ramp_elevator') {
        targetStop.accessibility.status = 'barrier';
        targetStop.accessibility.elevatorOperational = false;
        targetStop.accessibility.details = notes || 'Elevator or wheelchair ramp reported out of service.';
      }

      if (crowdingState) {
        targetStop.liveCrowdEstimate = crowdingState;
      }
      targetStop.lastReportTimestamp = now;
    }

    // Dynamically adjust route crowding or uncertainty
    if (targetRoute) {
      if (crowdingState === 'severe' || category === 'overcrowding') {
        targetRoute.crowdingScore = Math.min(100, targetRoute.crowdingScore + 10);
        targetRoute.crowdingLevel = 'severe';
      } else if (crowdingState === 'plenty') {
        targetRoute.crowdingScore = Math.max(15, targetRoute.crowdingScore - 12);
        targetRoute.crowdingLevel = 'plenty';
      }

      if (category === 'delay') {
        targetRoute.arrivalUncertaintyMinutes = Math.min(20, targetRoute.arrivalUncertaintyMinutes + 3);
        targetRoute.reliabilityScore = Math.min(100, targetRoute.reliabilityScore + 12);
      }
    }

    res.json({ success: true, report: newReport, stops, routes });
  } catch (error) {
    console.error('Error adding community report:', error);
    res.status(500).json({ error: 'Failed to record report' });
  }
});

// API: QR Stop Feedback (Slide 4: Scan stop QR code, tap two answers)
// "Tap two answers: Has the bus arrived? Seats: plenty, few, standing only. Everyone sees it: Estimates update. Reports expire after 60 minutes."
app.post('/api/qr-tap', (req: Request, res: Response) => {
  try {
    const { stopId, routeId, hasArrived, seats } = req.body;
    if (!stopId || !seats) {
      res.status(400).json({ error: 'stopId and seats selection required' });
      return;
    }

    const targetStop = stops.find(s => s.id === stopId);
    const targetRoute = routes.find(r => r.id === routeId) || routes[0];
    const now = Date.now();

    const newReport: CommunityReport = {
      id: `qr-${now.toString().slice(-6)}`,
      stopId,
      stopName: targetStop ? targetStop.name : stopId,
      routeId: targetRoute?.id,
      routeNumber: targetRoute?.routeNumber,
      category: 'qr_tap',
      hasArrived: Boolean(hasArrived),
      crowdingState: seats as 'plenty' | 'few' | 'standing',
      notes: `Verified QR Tap at ${targetStop?.name || 'Stop'}: Bus ${hasArrived ? 'arrived' : 'not yet'} · Seats: ${seats}`,
      reportedAt: now,
      expiresAt: now + (60 * 60 * 1000),
      upvotes: 3,
    };

    reports.unshift(newReport);
    cleanExpiredReports();

    if (targetStop) {
      targetStop.liveCrowdEstimate = seats;
      targetStop.lastReportTimestamp = now;
    }

    if (targetRoute) {
      if (seats === 'plenty') {
        targetRoute.crowdingScore = Math.max(20, targetRoute.crowdingScore - 15);
        targetRoute.crowdingLevel = 'plenty';
      } else if (seats === 'few') {
        targetRoute.crowdingScore = 55;
        targetRoute.crowdingLevel = 'few';
      } else if (seats === 'standing') {
        targetRoute.crowdingScore = Math.min(95, targetRoute.crowdingScore + 15);
        targetRoute.crowdingLevel = 'standing';
      }

      if (hasArrived) {
        targetRoute.arrivalMinutes = 1;
        targetRoute.arrivalUncertaintyMinutes = 1; // High certainty since verified at stop
      }
    }

    res.json({
      success: true,
      message: 'QR Feedback applied. Real-time arrival and crowding updated for all commuters.',
      report: newReport,
      stops,
      routes,
    });
  } catch (error) {
    console.error('QR tap feedback error:', error);
    res.status(500).json({ error: 'Failed to process QR feedback' });
  }
});

// API: Upvote report
app.post('/api/reports/:id/upvote', (req: Request, res: Response) => {
  const { id } = req.params;
  const report = reports.find(r => r.id === id);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  report.upvotes += 1;
  res.json({ success: true, upvotes: report.upvotes });
});

// API: Backtest evaluation data (Slide 7)
app.get('/api/backtest', (_req: Request, res: Response) => {
  res.json({
    summary: INITIAL_BACKTEST_SUMMARY,
    trips: INITIAL_BACKTEST_TRIPS,
  });
});

// ==========================================
// ETM (ELECTRONIC TICKETING MACHINE) DATABASE APIs
// Showcase for evaluators: Conductor terminal & database
// ==========================================

app.get('/api/etm/tickets', (_req: Request, res: Response) => {
  const totalRevenue = etmTickets.reduce((sum, t) => sum + t.fareAmount, 0);
  const specialCount = etmTickets.filter(t => t.passengerType !== 'General').length;

  res.json({
    success: true,
    tickets: etmTickets,
    stats: {
      totalTickets: etmTickets.length,
      totalRevenue,
      specialPassengers: specialCount,
      machineId: 'BMTC-ETM-908',
      batteryLevel: 94,
    },
  });
});

app.post('/api/etm/issue', (req: Request, res: Response) => {
  try {
    const {
      routeId,
      fromStopName,
      toStopName,
      passengerName,
      passengerAge,
      passengerType,
      seatNumber,
      fareAmount,
      discountApplied,
      paymentMode,
      riskScoreAtIssue,
      isStepFreeVerified,
    } = req.body;

    const targetRoute = routes.find(r => r.id === routeId) || routes[0];
    const ticketSeq = 849200 + etmTickets.length + 1;
    const ticketNumber = `BMTC-${ticketSeq}`;
    const now = Date.now();
    const qrHash = `VERIF-${targetRoute.routeNumber.split(' ')[1] || 'BUS'}-${ticketSeq}-${paymentMode || 'OK'}`;

    const newTicket: ETMTicket = {
      id: `tk-${now}`,
      ticketNumber,
      machineId: 'BMTC-ETM-908',
      routeId: targetRoute.id,
      routeNumber: targetRoute.routeNumber,
      fromStopName: fromStopName || targetRoute.from,
      toStopName: toStopName || targetRoute.to,
      passengerName: passengerName || 'Commuter',
      passengerAge: passengerAge ? parseInt(passengerAge, 10) : undefined,
      passengerType: passengerType || 'General',
      seatNumber: seatNumber || '04B',
      fareAmount: typeof fareAmount === 'number' ? fareAmount : targetRoute.fare,
      discountApplied: discountApplied || 0,
      paymentMode: paymentMode || 'UPI_QR',
      issuedAt: now,
      validUntil: now + (2 * 60 * 60 * 1000), // 2 hours validity
      riskScoreAtIssue: riskScoreAtIssue || 18,
      isStepFreeVerified: Boolean(isStepFreeVerified),
      qrVerificationHash: qrHash,
      status: 'VALID',
    };

    etmTickets.unshift(newTicket);

    // Update route seats count
    if (targetRoute.availableSeats > 0) {
      targetRoute.availableSeats -= 1;
    }

    // Update seat database (mark seat as occupied)
    const seatsForThisRoute = routeSeats[targetRoute.id] || routeSeats['route-335e'];
    if (seatsForThisRoute) {
      const targetSeatObj = seatsForThisRoute.find(s => s.seatNumber === newTicket.seatNumber);
      if (targetSeatObj) {
        targetSeatObj.isFree = false;
        targetSeatObj.passengerName = newTicket.passengerName;
        targetSeatObj.passengerCategory = newTicket.passengerType;
        targetSeatObj.ticketNumber = newTicket.ticketNumber;
      }
    }

    res.json({
      success: true,
      ticket: newTicket,
      message: 'ETM Ticket successfully generated, stored in Evaluator database, and printed.',
    });
  } catch (error) {
    console.error('Failed to issue ETM ticket:', error);
    res.status(500).json({ error: 'Failed to issue ticket on ETM machine' });
  }
});

app.post('/api/etm/verify', (req: Request, res: Response) => {
  const { qrCode } = req.body;
  const match = etmTickets.find(t => t.qrVerificationHash === qrCode || t.ticketNumber === qrCode);

  if (match) {
    match.status = 'BOARDED';
    res.json({
      valid: true,
      ticket: match,
      message: `Verified: ${match.passengerName} (${match.passengerType}) on ${match.routeNumber}`,
    });
  } else {
    res.json({
      valid: false,
      message: 'Ticket not found or hash unverified in Evaluator database',
    });
  }
});

app.post('/api/etm/reset', (_req: Request, res: Response) => {
  etmTickets = JSON.parse(JSON.stringify(INITIAL_ETM_TICKETS));
  routeSeats = JSON.parse(JSON.stringify(INITIAL_ROUTE_SEATS));
  gpsFleet = JSON.parse(JSON.stringify(INITIAL_ETM_GPS_FLEET));
  res.json({ success: true, message: 'ETM Database reset to baseline showcase dataset.' });
});

// GET /api/etm/seats/:routeId - Returns live seat occupancy database (Free vs Booked)
app.get('/api/etm/seats/:routeId', (req: Request, res: Response) => {
  const { routeId } = req.params;
  const seats = routeSeats[routeId] || routeSeats['route-335e'] || [];
  const freeCount = seats.filter(s => s.isFree).length;
  const bookedCount = seats.filter(s => !s.isFree).length;

  res.json({
    routeId,
    totalCapacity: seats.length,
    freeSeatsCount: freeCount,
    bookedSeatsCount: bookedCount,
    seats,
  });
});

// POST /api/etm/seats/toggle - Conductor or passenger seat state toggle
app.post('/api/etm/seats/toggle', (req: Request, res: Response) => {
  const { routeId, seatNumber, passengerName, passengerCategory } = req.body;
  const targetSeats = routeSeats[routeId] || routeSeats['route-335e'];
  if (!targetSeats) {
    res.status(404).json({ error: 'Route seats not found' });
    return;
  }

  const seat = targetSeats.find(s => s.seatNumber === seatNumber);
  if (!seat) {
    res.status(404).json({ error: 'Seat not found' });
    return;
  }

  seat.isFree = !seat.isFree;
  if (!seat.isFree) {
    seat.passengerName = passengerName || 'Reserved Commuter';
    seat.passengerCategory = passengerCategory || 'General';
  } else {
    seat.passengerName = undefined;
    seat.passengerCategory = undefined;
    seat.ticketNumber = undefined;
  }

  res.json({ success: true, seat, allSeats: targetSeats });
});

// GET /api/etm/gps - Live ETM Machine GPS Tracker Telemetry for Fleet
app.get('/api/etm/gps', (_req: Request, res: Response) => {
  // Add subtle live drifting jitter (10-20 meters) to simulate live real-time GPS telemetry
  const now = Date.now();
  gpsFleet.forEach((bus, i) => {
    bus.lastPingTimestamp = now - (i * 1200);
    // Subtle speed variation
    bus.speedKmH = Math.max(10, Math.min(60, bus.speedKmH + (Math.random() > 0.5 ? 1 : -1)));
    // Minor coordinate drift along corridor
    bus.latitude += (Math.random() - 0.5) * 0.0002;
    bus.longitude += (Math.random() - 0.5) * 0.0002;
  });

  res.json({
    success: true,
    count: gpsFleet.length,
    fleet: gpsFleet,
    serverTime: new Date().toISOString(),
  });
});

// API: AI Transit Risk Advisor (powered by Gemini)
app.post('/api/advisor', async (req: Request, res: Response) => {
  const { userPrompt, profileId, language } = req.body;
  const lang = language || 'en';

  const systemInstructions = `
You are TRANSITSHIELD, an intelligent and empathetic public transportation advisor.
Your mission is to help commuters choose safer, less crowded, accessible journeys using the Journey Risk Score concept.
Rule 1: Never recommend the fastest route if it suffers from high crowding, delay uncertainty, or accessibility barriers.
Rule 2: For wheelchair commuters, step-free access is an absolute hard rule. Never suggest routes with barriers or stairs.
Rule 3: Mention the Journey Risk Score (lower is safer) and compare why Bus 335E or Metro + Feeder outperforms Bus 500D despite 500D's nominal shorter travel time.
Rule 4: Provide responses in the requested language: '${lang}' (en = English, hi = Hindi, kn = Kannada).
Be clear, concise, actionable, and warm. Include 2-3 bullet points max.
  `.trim();

  // If Gemini API is available, generate smart contextual advisory with safety timeout
  if (aiClient) {
    try {
      const geminiPromise = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstructions}\n\nCommuter query: "${userPrompt}"\nProfile: ${profileId}` }] },
        ],
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 6000)
      );

      const response = await Promise.race([geminiPromise, timeoutPromise]);
      const responseText = response.text || 'Journey recommendation generated based on real-time risk scores.';
      res.json({
        advisorText: responseText,
        source: 'gemini-3.8-flash',
        recommendedRouteId: profileId === 'wheelchair' ? 'route-335e' : (userPrompt?.toLowerCase().includes('metro') ? 'route-metro-feeder' : 'route-335e'),
      });
      return;
    } catch (err) {
      console.warn('Gemini API call failed or timed out, falling back to deterministic risk advisor:', err);
    }
  }

  // Deterministic multilingual fallback if Gemini key is not provided or fails
  const fallbackAdvice: Record<string, string> = {
    en: `TransitShield Recommendation for ${profileId === 'wheelchair' ? 'Wheelchair User' : 'Commuter'}:
• Take Bus 335E or Metro Feeder: Safest Journey Risk Score (18 vs 52 on Bus 500D).
• Step-free boarding verified with 100% low-floor access and ample available seating.
• Avoid Bus 500D: Although marketed as fastest (38m), it currently has 92% crowding and an ±11 min arrival variance.`,
    hi: `ट्रांजिट शील्ड सुरक्षित यात्रा सिफारिश:
• बस 335E या मेट्रो फीडर चुनें: सबसे कम जोखिम स्कोर (18 बनाम 500D का 52)।
• लो-फ्लोर बस और बाधा-मुक्त रैंप उपलब्ध है।
• बस 500D से बचें: 92% भीड़ और 11 मिनट की अनिश्चितता के कारण यह असुरक्षित है।`,
    kn: `ಟ್ರಾನ್ಸಿಟ್‌ಶೀಲ್ಡ್ ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ ಶಿಫಾರಸು:
• ಬಸ್ 335E ಅಥವಾ ಮೆಟ್ರೋ ಫೀಡರ್ ಆಯ್ಕೆಮಾಡಿ: ಅತ್ಯಂತ ಕಡಿಮೆ ಅಪಾಯದ ಅಂಕ (18 vs 500D ಯ 52).
• ಮೆಟ್ಟಿಲು ರಹಿತ, ಲೋ-ಫ್ಲೋರ್ ಪ್ರವೇಶ ಮತ್ತು ಆಸನಗಳು ಸುಲಭವಾಗಿ ಲಭ್ಯವಿವೆ.
• ಬಸ್ 500D ತಪ್ಪಿಸಿ: ಕೇವಲ ಪ್ರಯಾಣದ ಸಮಯವನ್ನು ನಂಬಬೇಡಿ, ಇದರಲ್ಲಿ ವಿಪರೀತ ಜನದಟ್ಟಣೆ ಇದೆ.`,
  };

  res.json({
    advisorText: fallbackAdvice[lang] || fallbackAdvice.en,
    source: 'deterministic-rules-engine',
    recommendedRouteId: profileId === 'wheelchair' ? 'route-335e' : 'route-metro-feeder',
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRANSITSHIELD fullstack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
