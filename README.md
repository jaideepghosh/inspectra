<img src="https://inspectra.jaideepghosh.com/logo.png" alt="Inspectra" width="200"/>

**Buyer-centric vehicle inspection platform.**

Inspectra helps motorcycle buyers perform a **structured Pre-Delivery Inspection (PDI)** before accepting delivery from a dealership.

The app guides buyers through a step-by-step checklist, captures photo evidence, and generates a **professional inspection report** within minutes.

# Why Inspectra?

Most buyers accept a motorcycle delivery **without performing a proper inspection**.

Common problems include:

- Hidden scratches or cosmetic damage
- Incorrect VIN or engine numbers
- Odometer discrepancies
- Missing accessories or documents
- No proof if issues are discovered later

Inspectra makes inspections **simple, structured, and evidence-based**.

# What You Can Do

### Guided Inspection

Inspectra walks buyers through inspection sections step-by-step:

- Bike Identity
- Exterior Condition
- Wheels & Tyres
- Suspension & Chassis
- Brakes
- Engine & Controls
- Electrical System
- Instrument Cluster
- Accessories & Documents

Each section contains **clear checklist items**.

### Capture Photo Evidence

Users can capture photos directly from their phone.

Mandatory photos include:

- Front view
- Rear view
- Chassis number
- Odometer
- Left side
- Right side

This ensures **visual proof of vehicle condition**.

### Identify Issues

For every inspection item the user can:

- Mark **Pass**
- Mark **Issue**
- Add comments
- Attach supporting photos

### Generate a Professional Report

After completing the inspection, Inspectra generates a **downloadable PDF report** that includes:

- Motorcycle details
- Full inspection checklist
- Photo evidence
- Timestamp

This report can be **saved or shared as documentation**.

# Product Flow

```
Open App
   ↓
Enter Bike Details
   ↓
Start Guided Inspection
   ↓
Capture Mandatory Photos
   ↓
Review Inspection Summary
   ↓
Generate PDF Report
```

A complete inspection should take **less than 10 minutes**.

# Core Features (MVP)

- Mobile-first responsive interface
- Structured inspection checklist
- Pass / Issue status tracking
- Optional comments
- Camera photo capture
- Mandatory photo validation
- Inspection progress tracking
- Inspection summary screen
- Auto-generated PDF report
- Local data storage during inspection

# Data Model

### Bike

```
VIN
EngineNumber
Model
Color
DealerName
Odometer
```

### Inspection

```
InspectionID
BikeID
Date
TotalChecks
PassedChecks
FailedChecks
```

### Checklist Item

```
Section
Description
Status
Comment
PhotoURL
```

### Photos

```
InspectionID
ImageType
FileURL
```

# Tech Stack

**Frontend**

- React / Next.js
- Mobile-optimized UI
- Camera integration

**Backend**

- Node.js / Firebase / Supabase

**Storage**

- Cloud image storage

**Reporting**

- PDF report generation

# Design Principles

Inspectra is built with three core principles:

**1. Simplicity**

The interface must be usable by **first-time motorcycle buyers without training**.

**2. Speed**

A complete inspection should take **under 10 minutes**.

**3. Proof**

Every inspection should produce **clear, verifiable documentation**.

# Roadmap

Future versions of Inspectra may include:

- Support for multiple motorcycle models
- Custom inspection templates
- Dealer dashboards
- Manufacturer integrations
- Cloud inspection history
- Warranty claim support
- Fleet and enterprise inspection workflows

# Vision

Inspectra aims to become a **universal inspection platform** for vehicle quality assurance.

From **individual buyers** to **enterprise dealerships**, Inspectra will help ensure that every vehicle delivery is **transparent, documented, and verifiable**.
