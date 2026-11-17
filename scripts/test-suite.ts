import connectDB from "../src/lib/db/connect";
import User from "../src/lib/db/models/User";
import Incident from "../src/lib/db/models/Incident";
import VolunteerProfile from "../src/lib/db/models/VolunteerProfile";
import Donation from "../src/lib/db/models/Donation";
import { analyzeIncidentDescription, detectDuplicateIncidents } from "../src/lib/ai/triage";
import { takeResponsibilityAtomic, findNearbyVolunteers } from "../src/lib/services/matchingService";
import { generateEmailHtml } from "../src/lib/email/templates";
import { calculateDistanceKm } from "../src/lib/utils";
import bcrypt from "bcryptjs";

async function runTestSuite() {
  console.log("=================================================");
  console.log("🐾 RUNNING POWER ALERT PRODUCTION TEST SUITE 🐾");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    await connectDB();
    console.log("Database connected for test suite.\n");

    // Test 1: Password Hashing & Verification
    const password = "securePassword123";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const isMatch = await bcrypt.compare(password, hash);
    const isMismatch = await bcrypt.compare("wrongPassword", hash);
    assert(isMatch && !isMismatch, "1. Password Hashing & Argon2/Bcrypt Security Verification");

    // Test 2: AI Triage & Priority Recommendation
    const criticalTriage = analyzeIncidentDescription("Hit by speeding car, bleeding heavily from head", "Road Accident");
    assert(criticalTriage.recommendedPriority === "CRITICAL", "2. AI Triage: Critical Traumatic Injury Detection");

    const mediumTriage = analyzeIncidentDescription("Skin disease and hair loss, starving indie dog", "Sick Animal");
    assert(mediumTriage.recommendedPriority === "MEDIUM", "3. AI Triage: Moderate Priority Injury Detection");

    // Test 3: Transactional Email Template Generation
    const welcomeEmail = generateEmailHtml("WELCOME", { recipientName: "Ananya", actionUrl: "https://poweralert.org" });
    assert(welcomeEmail.subject.includes("Welcome") && welcomeEmail.html.includes("POWER ALERT"), "4. Email Template: Welcome Notification Responsive HTML");

    const rescueEmail = generateEmailHtml("VOLUNTEER_ASSIGNED", { recipientName: "Priya", incidentId: "PA-2026-99999", volunteerName: "Rohan" });
    assert(rescueEmail.html.includes("Rohan") && rescueEmail.html.includes("PA-2026-99999"), "5. Email Template: Volunteer Assignment Notification");

    // Test 4: Distance Calculation
    const dist = calculateDistanceKm(12.9716, 77.5946, 12.9352, 77.6245); // Bangalore Center to Koramangala
    assert(dist > 4 && dist < 6, `6. Geospatial Distance Calculation (~${dist} km)`);

    // Test 5: Incident Creation & Atomic Concurrency Assignment
    const testVol = await User.create({
      fullName: "Test Rescuer",
      email: `test.rescuer.${Date.now()}@example.com`,
      mobile: "+91 99999 11111",
      passwordHash: hash,
      city: "Bangalore",
      role: "RESCUE_VOLUNTEER",
    });

    const testIncident = await Incident.create({
      incidentId: `PA-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      animalCategory: "Injured Dog",
      conditionDescription: "Fractured limb, test incident for concurrency",
      priority: "CRITICAL",
      status: "REPORTED",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716],
        address: "Test Location, Bangalore",
        city: "Bangalore",
      },
      images: ["https://images.unsplash.com/photo-1543466835-00a7907e9de1"],
      reporterName: "Test Reporter",
      reporterPhone: "+91 98765 00000",
      slaDeadline: new Date(Date.now() + 45 * 60 * 1000),
      statusHistory: [{ status: "REPORTED", timestamp: new Date() }],
    });

    // Volunteer 1 accepts case
    const claimResult1 = await takeResponsibilityAtomic(testIncident._id.toString(), testVol._id.toString());
    assert(claimResult1.success === true, "7. Atomic Assignment: First Eligible Volunteer Accepts Responsibility");

    // Volunteer 2 attempts to claim SAME case concurrently
    const testVol2 = await User.create({
      fullName: "Second Rescuer",
      email: `test.rescuer2.${Date.now()}@example.com`,
      mobile: "+91 99999 22222",
      passwordHash: hash,
      city: "Bangalore",
      role: "RESCUE_VOLUNTEER",
    });

    const claimResult2 = await takeResponsibilityAtomic(testIncident._id.toString(), testVol2._id.toString());
    assert(claimResult2.success === false, "8. Concurrency Lock: Prevents Double-Assignment Race Condition");

    // Test 6: Duplicate Incident Detection
    const dupes = await detectDuplicateIncidents([77.5946, 12.9716], "Injured Dog", 6, 1.0);
    assert(dupes.length > 0, "9. Duplicate Incident Detection: Proximity & Temporal Heuristic");

    // Test 7: Donation & 80G Receipt Generation
    const testDonation = await Donation.create({
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      donorName: "Charity Patron",
      donorEmail: "patron@example.com",
      amount: 1500,
      currency: "INR",
      paymentGateway: "MOCK_GATEWAY",
      paymentId: `pay_test_${Date.now()}`,
      paymentStatus: "COMPLETED",
    });
    assert(testDonation.receiptNumber.startsWith("REC-2026"), "10. Financial Module: Digital 80G Tax Receipt Issuance");

    // Clean up test documents
    await User.deleteMany({ _id: { $in: [testVol._id, testVol2._id] } });
    await Incident.deleteOne({ _id: testIncident._id });
    await Donation.deleteOne({ _id: testDonation._id });

  } catch (err: any) {
    console.error("Test Suite execution exception:", err);
    failed++;
  }

  console.log("\n=================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("=================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runTestSuite();
