import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import VolunteerProfile from "@/lib/db/models/VolunteerProfile";
import NGO from "@/lib/db/models/NGO";
import Incident from "@/lib/db/models/Incident";
import RescueAssignment from "@/lib/db/models/RescueAssignment";
import Animal from "@/lib/db/models/Animal";
import MedicalRecord from "@/lib/db/models/MedicalRecord";
import FeedingZone from "@/lib/db/models/FeedingZone";
import FeedingActivity from "@/lib/db/models/FeedingActivity";
import Shelter from "@/lib/db/models/Shelter";
import Veterinarian from "@/lib/db/models/Veterinarian";
import AdoptionListing from "@/lib/db/models/AdoptionListing";
import MissingAnimal from "@/lib/db/models/MissingAnimal";
import Donation from "@/lib/db/models/Donation";
import Notification from "@/lib/db/models/Notification";
import EmailLog from "@/lib/db/models/EmailLog";

export async function POST() {
  try {
    await connectDB();

    // Check if already seeded
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return NextResponse.json({
        message: "Database already contains users. Existing data preserved.",
        status: "ALREADY_SEEDED",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash("password123", salt);

    // 1. Create Super Admin
    const superAdmin = await User.create({
      fullName: "Antigravity Admin",
      email: "admin@poweralert.org",
      mobile: "+91 98765 00001",
      passwordHash: passHash,
      city: "Bangalore",
      address: "MG Road, Central Command",
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      role: "SUPER_ADMIN",
      isEmailVerified: true,
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    });

    // 2. Create NGO Admin
    const ngoAdmin = await User.create({
      fullName: "Ananya Deshmukh",
      email: "ngo@poweralert.org",
      mobile: "+91 98765 00002",
      passwordHash: passHash,
      city: "Bangalore",
      address: "Indiranagar 100ft Road",
      location: { type: "Point", coordinates: [77.6412, 12.9784] },
      role: "NGO_ADMIN",
      isEmailVerified: true,
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    });

    // 3. Create NGO
    const ngo = await NGO.create({
      name: "Paws & Hope Animal Rescue Foundation",
      registrationNumber: "NGO-BLR-2022-7789",
      email: "contact@pawsandhope.org",
      phone: "+91 80 2525 8899",
      website: "https://pawsandhope.org",
      location: {
        type: "Point",
        coordinates: [77.6412, 12.9784],
        address: "742, 12th Main Road, Indiranagar",
        city: "Bangalore",
      },
      logo: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=200&q=80",
      description: "Non-profit animal sanctuary and 24x7 trauma rescue foundation operating mobile trauma ambulances.",
      verificationStatus: "VERIFIED",
      adminUserId: ngoAdmin._id,
      serviceRadiusKm: 30,
      shelterCapacity: 60,
      currentShelterOccupancy: 28,
      stats: { totalRescues: 412, activeCases: 8, volunteersCount: 45 },
    });

    ngoAdmin.ngoId = ngo._id;
    await ngoAdmin.save();

    // 4. Create Rescue Volunteer
    const volunteerUser = await User.create({
      fullName: "Rohan Varma",
      email: "volunteer@poweralert.org",
      mobile: "+91 98765 00003",
      passwordHash: passHash,
      city: "Bangalore",
      address: "Koramangala 4th Block",
      location: { type: "Point", coordinates: [77.6245, 12.9352] },
      role: "RESCUE_VOLUNTEER",
      isEmailVerified: true,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    });

    const volunteerProfile = await VolunteerProfile.create({
      userId: volunteerUser._id,
      category: "RESCUE",
      status: "APPROVED",
      skills: ["Animal Handling", "First Aid", "Trauma Stabilization", "Night Rescue"],
      serviceArea: {
        type: "Point",
        coordinates: [77.6245, 12.9352],
        radiusKm: 15,
        address: "Koramangala & HSR Layout Sector",
      },
      availability: "AVAILABLE",
      activeCasesCount: 1,
      totalRescuesCompleted: 34,
      experienceYears: 4,
      vehicleType: "FOUR_WHEELER",
      ngoAffiliationId: ngo._id,
      approvedBy: ngoAdmin._id,
      approvedAt: new Date(),
    });

    volunteerUser.activeVolunteerProfileId = volunteerProfile._id;
    await volunteerUser.save();

    // 5. Create Veterinarian
    const vetUser = await User.create({
      fullName: "Dr. Shalini Rao, BVSc",
      email: "vet@poweralert.org",
      mobile: "+91 98765 00004",
      passwordHash: passHash,
      city: "Bangalore",
      address: "Jayanagar 4th Block",
      location: { type: "Point", coordinates: [77.5833, 12.9304] },
      role: "VETERINARIAN",
      isEmailVerified: true,
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80",
    });

    await Veterinarian.create({
      userId: vetUser._id,
      clinicName: "Heal & Paws Specialty Veterinary Care",
      licenseNumber: "KVC-VET-88392",
      qualifications: ["BVSc & AH", "MVSc Surgery & Radiology"],
      yearsOfExperience: 8,
      specialization: ["Orthopedic Surgery", "Emergency Critical Care", "Canine Traumatology"],
      location: {
        type: "Point",
        coordinates: [77.5833, 12.9304],
        address: "32, 11th Main, Jayanagar 4th Block",
        city: "Bangalore",
      },
      contactPhone: "+91 80 4112 3344",
      isEmergencyAvailable: true,
      status: "VERIFIED",
    });

    // 6. Create Public User (Reporter)
    const publicUser = await User.create({
      fullName: "Priya Sharma",
      email: "user@poweralert.org",
      mobile: "+91 98765 00005",
      passwordHash: passHash,
      city: "Bangalore",
      address: "Whitefield Inner Circle",
      location: { type: "Point", coordinates: [77.7499, 12.9698] },
      role: "PUBLIC_USER",
      isEmailVerified: true,
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    });

    // 7. Create Shelter
    const shelter = await Shelter.create({
      name: "Paws & Hope Rehabilitation Sanctuary",
      ngoId: ngo._id,
      location: {
        type: "Point",
        coordinates: [77.6821, 13.0012],
        address: "Survey 42, Horamavu Ring Road",
        city: "Bangalore",
      },
      contactPhone: "+91 80 2525 8899",
      contactEmail: "shelter@pawsandhope.org",
      capacity: 50,
      currentOccupancy: 22,
      facilities: ["Quarantine Ward", "Surgical Recovery Room", "Hydrotherapy Pool", "Aviary Enclosure"],
      operatingHours: "08:00 AM - 08:00 PM",
      images: [
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
      ],
      status: "OPEN",
    });

    // 8. Create Realistic Incidents
    const now = new Date();

    // Incident 1: Critical unassigned
    await Incident.create({
      incidentId: "PA-2026-104921",
      animalCategory: "Road Accident",
      conditionDescription: "Community dog hit by speeding car. Bleeding from rear leg, unable to stand, whined in severe pain. Needs immediate emergency splint & pain relief.",
      priority: "CRITICAL",
      status: "REPORTED",
      location: {
        type: "Point",
        coordinates: [77.6289, 12.9341],
        address: "Opposite Forum Mall, Hosur Main Road, Koramangala",
        landmark: "Next to Metro Pillar 124",
        city: "Bangalore",
      },
      images: [
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
      ],
      reporterId: publicUser._id,
      reporterName: "Priya Sharma",
      reporterPhone: "+91 98765 00005",
      reporterEmail: "user@poweralert.org",
      slaDeadline: new Date(now.getTime() + 35 * 60 * 1000),
      isEscalated: false,
      statusHistory: [
        {
          status: "REPORTED",
          timestamp: new Date(now.getTime() - 10 * 60 * 1000),
          notes: "Incident reported by Priya. AI Priority: CRITICAL. Fast broadcast dispatched.",
          locationSnapshot: [77.6289, 12.9341],
        },
      ],
    });

    // Incident 2: Active Rescue (Assigned to Rohan Varma)
    const incidentAssigned = await Incident.create({
      incidentId: "PA-2026-104922",
      animalCategory: "Injured Cat",
      conditionDescription: "Kitten trapped between barbed fence on terrace. Minor lacerations on neck and paw. Crying continuously.",
      priority: "HIGH",
      status: "VOLUNTEER_EN_ROUTE",
      location: {
        type: "Point",
        coordinates: [77.6355, 12.9712],
        address: "100 Feet Road, HAL 2nd Stage, Indiranagar",
        landmark: "Above Blue Tokai Coffee",
        city: "Bangalore",
      },
      images: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
      ],
      reporterId: publicUser._id,
      reporterName: "Karthik Nair",
      reporterPhone: "+91 98450 11223",
      reporterEmail: "karthik.nair@example.com",
      assignedVolunteerId: volunteerUser._id,
      assignedVolunteerProfileId: volunteerProfile._id,
      assignedNgoId: ngo._id,
      assignedAt: new Date(now.getTime() - 25 * 60 * 1000),
      acceptedAt: new Date(now.getTime() - 22 * 60 * 1000),
      enRouteAt: new Date(now.getTime() - 10 * 60 * 1000),
      slaDeadline: new Date(now.getTime() + 65 * 60 * 1000),
      isEscalated: false,
      statusHistory: [
        {
          status: "REPORTED",
          timestamp: new Date(now.getTime() - 30 * 60 * 1000),
          notes: "Report received via mobile app.",
        },
        {
          status: "VOLUNTEER_ASSIGNED",
          timestamp: new Date(now.getTime() - 22 * 60 * 1000),
          updatedBy: volunteerUser._id,
          updaterRole: "RESCUE_VOLUNTEER",
          notes: "Rohan Varma took responsibility.",
        },
        {
          status: "VOLUNTEER_EN_ROUTE",
          timestamp: new Date(now.getTime() - 10 * 60 * 1000),
          updatedBy: volunteerUser._id,
          notes: "Driving with cat carrier and wire cutter. ETA 7 mins.",
        },
      ],
    });

    await RescueAssignment.create({
      incidentId: incidentAssigned._id,
      volunteerId: volunteerUser._id,
      ngoId: ngo._id,
      status: "ACCEPTED",
      notes: "Volunteer currently en route.",
    });

    // Incident 3: Rescued & Under Treatment
    const rescuedAnimal = await Animal.create({
      name: "Sheru",
      species: "Dog",
      breed: "Indian Pariah Mix",
      ageYears: 3,
      gender: "MALE",
      healthStatus: "UNDER_TREATMENT",
      shelterId: shelter._id,
      ngoId: ngo._id,
      images: [
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
      ],
      isVaccinated: true,
      isSterilized: true,
    });

    await Incident.create({
      incidentId: "PA-2026-104918",
      animalCategory: "Sick Animal",
      conditionDescription: "Stray indie dog suffering from severe deep maggot wound on back and high fever.",
      priority: "HIGH",
      status: "TREATMENT_STARTED",
      location: {
        type: "Point",
        coordinates: [77.5891, 12.9288],
        address: "9th Cross, Jayanagar 3rd Block",
        city: "Bangalore",
      },
      images: [
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
      ],
      reporterName: "Meera Sen",
      reporterPhone: "+91 97400 33441",
      assignedVolunteerId: volunteerUser._id,
      assignedNgoId: ngo._id,
      assignedVetId: vetUser._id,
      slaDeadline: new Date(now.getTime() - 2 * 3600 * 1000),
      statusHistory: [
        { status: "REPORTED", timestamp: new Date(now.getTime() - 24 * 3600 * 1000) },
        { status: "VOLUNTEER_ASSIGNED", timestamp: new Date(now.getTime() - 23 * 3600 * 1000) },
        { status: "ANIMAL_RESCUED", timestamp: new Date(now.getTime() - 20 * 3600 * 1000) },
        { status: "TREATMENT_STARTED", timestamp: new Date(now.getTime() - 18 * 3600 * 1000), notes: "Wound cleaned, maggot larvae extracted, antiseptic bandage applied." },
      ],
    });

    // Medical record for Sheru
    await MedicalRecord.create({
      animalId: rescuedAnimal._id,
      vetId: vetUser._id,
      clinicName: "Heal & Paws Specialty Veterinary Care",
      diagnosis: "Deep maggot infestation in right flank, secondary bacterial dermatitis, mild dehydration.",
      vitals: { temperatureC: 39.4, weightKg: 18.5, heartRateBpm: 110 },
      prescriptions: [
        { medicineName: "Amoxicillin + Clavulanic Acid", dosage: "375 mg", frequency: "Twice daily", durationDays: 7 },
        { medicineName: "Meloxicam", dosage: "0.2 mg/kg", frequency: "Once daily", durationDays: 3 },
        { medicineName: "Ivermectin Oral Solution", dosage: "0.2 mg/kg", frequency: "Single dose", durationDays: 1 },
      ],
      surgeries: [
        { procedure: "Debridement & Maggot Wound Irrigation", date: new Date(now.getTime() - 18 * 3600 * 1000) },
      ],
      vaccinations: [
        { vaccineName: "Anti-Rabies Vaccine (ARV)", administeredDate: new Date() },
      ],
      treatmentProgress: "IMPROVING",
      generalNotes: "Sheru is responsive, eating boiled chicken and rice, wound granulating nicely.",
    });

    // 9. Feeding Zones
    const zone1 = await FeedingZone.create({
      zoneName: "Koramangala 4th Block Park Perimeter",
      location: {
        type: "Point",
        coordinates: [77.6241, 12.9348],
        address: "Near 17th Cross Playground, Koramangala 4th Block",
        landmark: "Behind Community Center",
      },
      estimatedAnimalCount: 8,
      speciesPresent: ["Dog", "Cat"],
      hasWaterPoint: true,
      waterBowlCondition: "CLEAN",
      dailyFoodKg: 6,
      foodType: "Steamed Rice, Eggs & Chicken Broth with Kibble",
      feedingTimeSlots: ["07:30 AM", "06:00 PM"],
      assignedVolunteerIds: [volunteerUser._id],
      ngoId: ngo._id,
      status: "ACTIVE",
      lastFedAt: new Date(now.getTime() - 3 * 3600 * 1000),
      lastWaterRefilledAt: new Date(now.getTime() - 3 * 3600 * 1000),
      photos: [
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
      ],
    });

    // Feeding activity log
    await FeedingActivity.create({
      zoneId: zone1._id,
      volunteerId: volunteerUser._id,
      fedAt: new Date(now.getTime() - 3 * 3600 * 1000),
      foodGivenKg: 6.0,
      waterRefilledLiters: 10,
      animalsCounted: 8,
      proofPhotos: [
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
      ],
      notes: "All 8 indies fed happily. Scrubbed cement water basin and refilled with fresh tap water.",
      isWaterBowlCleaned: true,
    });

    // 10. Adoption Listings
    await AdoptionListing.create({
      title: "Bella - Sweet & Cuddle-loving Golden Indie Pup",
      name: "Bella",
      species: "Dog",
      breed: "Indie Retriever Mix",
      age: "8 Months",
      gender: "Female",
      size: "Medium",
      goodWithKids: true,
      goodWithOtherPets: true,
      isVaccinated: true,
      isNeutered: true,
      story: "Rescued during monsoon floods, Bella is playful, house-trained, and eager to give endless forehead kisses. She loves squeaky toys and quiet evenings.",
      personalityTraits: ["Gentle", "Affectionate", "Fast Learner", "Leash Trained"],
      photos: [
        "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
      ],
      location: "Bangalore",
      ngoId: ngo._id,
      status: "AVAILABLE",
      featured: true,
    });

    await AdoptionListing.create({
      title: "Milo - Playful Green-Eyed Calico Cat",
      name: "Milo",
      species: "Cat",
      breed: "Domestic Shorthair",
      age: "1.2 Years",
      gender: "Male",
      size: "Small",
      goodWithKids: true,
      goodWithOtherPets: false,
      isVaccinated: true,
      isNeutered: true,
      story: "Found abandoned in a carton box as a kitten, Milo is now healthy, purrs whenever you walk into the room, and loves sunbathing on windowsills.",
      personalityTraits: ["Curious", "Purr Machine", "Independent"],
      photos: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
      ],
      location: "Bangalore",
      ngoId: ngo._id,
      status: "AVAILABLE",
      featured: true,
    });

    // 11. Missing Animals
    await MissingAnimal.create({
      petName: "Bruno",
      species: "Dog",
      breed: "Beagle",
      color: "Tricolor (White, Brown, Black)",
      gender: "Male",
      age: "3 Years",
      distinctiveMarks: "White tip on tail, black patch over left eye",
      collarDescription: "Reflective red collar with bell tag",
      photos: [
        "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80",
      ],
      lastSeenLocation: {
        type: "Point",
        coordinates: [77.6322, 12.9734],
        address: "Near 12th Main defense colony, Indiranagar",
        city: "Bangalore",
      },
      lostDate: new Date(now.getTime() - 48 * 3600 * 1000),
      ownerName: "Akash Mehra",
      ownerPhone: "+91 99001 22334",
      ownerEmail: "akash.mehra@example.com",
      showPhonePublicly: true,
      rewardAmount: 5000,
      status: "MISSING",
    });

    // 12. Donations
    await Donation.create({
      receiptNumber: "REC-2026-0041",
      donorName: "Sunita Kulkarni",
      donorEmail: "sunita.k@example.com",
      amount: 2500,
      currency: "INR",
      campaignTitle: "Emergency Trauma Surgery Fund",
      category: "EMERGENCY_MEDICAL",
      paymentGateway: "MOCK_GATEWAY",
      paymentId: "pay_mock_773821",
      paymentStatus: "COMPLETED",
      ngoId: ngo._id,
      message: "For Sheru's treatment and medicine! Stay strong champions.",
      isTaxExempt80G: true,
    });

    await Donation.create({
      receiptNumber: "REC-2026-0042",
      donorName: "Vikram Singhania",
      donorEmail: "vikram@example.com",
      amount: 5000,
      currency: "INR",
      campaignTitle: "Daily Street Dog Feeding Drive",
      category: "FEEDING_DRIVE",
      paymentGateway: "MOCK_GATEWAY",
      paymentId: "pay_mock_773822",
      paymentStatus: "COMPLETED",
      ngoId: ngo._id,
      message: "In memory of my beloved dog Leo.",
      isTaxExempt80G: true,
    });

    // 13. Notifications & Email Logs
    await Notification.create({
      recipientUserId: publicUser._id,
      title: "🐾 Alert Dispatched!",
      message: "Your emergency report #PA-2026-104921 has been broadcast to nearby rescuers.",
      type: "EMERGENCY_ALERT",
      priority: "HIGH",
    });

    await EmailLog.create({
      recipientEmail: "user@poweralert.org",
      recipientName: "Priya Sharma",
      subject: "Welcome to POWER ALERT! Together, We Save Lives 🐾",
      templateName: "WELCOME",
      status: "SENT",
      providerMessageId: "msg_seed_demo_01",
      sentAt: new Date(now.getTime() - 24 * 3600 * 1000),
    });

    return NextResponse.json({
      message: "Database seeded successfully with authentic production records!",
      credentials: {
        admin: "admin@poweralert.org / password123",
        ngo: "ngo@poweralert.org / password123",
        volunteer: "volunteer@poweralert.org / password123",
        vet: "vet@poweralert.org / password123",
        user: "user@poweralert.org / password123",
      },
      counts: {
        users: 5,
        incidents: 3,
        feedingZones: 1,
        shelters: 1,
        adoptionListings: 2,
        missingAnimals: 1,
        donations: 2,
      },
    });
  } catch (err: any) {
    console.error("Seeding error:", err);
    return NextResponse.json({ error: err.message || "Failed to seed database" }, { status: 500 });
  }
}
