# RFN Workspaces

RFN Workspaces is a professional operations platform for the Robloxian Franchise Network.

## System Overview

RFN Workspaces is designed to provide:

- Customer workspace management
- RFN employee operations
- Internship and training rooms
- Ticket handling
- Workspace oversight
- Administrative controls
- Activity logging
- Role-based access
- Firebase-powered realtime systems

## Current Architecture

### Public Pages
- Landing page
- Login page
- Signup page

### Customer Operations
- Customer dashboard
- Workspace creation and verification
- Workspace management
- Workspace settings
- Member management
- Ticket center

### RFN Employee Operations
- Employee hub
- Workspace oversight
- Workspace review
- Tasks
- Staff directory

### Oversight Systems
- Audit center
- Report center
- Activity logs

### Internship Systems
- Internship center
- Internship room
- Assignment submission structure

### Administrative Systems
- User management
- Customer approvals
- Role management
- System settings
- Security center

## Firebase Setup

### 1. Enable Authentication
Enable Email/Password Authentication inside Firebase Authentication.

### 2. Enable Firestore Database
Create a Firestore database in production mode.

### 3. Add Authorized Domains
Add your GitHub Pages domain under Authentication > Settings > Authorized Domains.

### 4. Deploy Firestore Rules
Paste the firestore.rules file into Firebase Firestore Rules.

### 5. Deploy to GitHub Pages
Enable GitHub Pages from the repository settings.

## Firestore Bootstrap System

The project automatically initializes missing foundational documents including:

- systemSettings
- permissions
- roles
- departments
- approvedCustomers
- workspaces
- tickets
- internships
- activityLogs

## Security Structure

The platform includes:

- Role-based access control
- Administrative permission checks
- Workspace access restrictions
- Activity log protections
- Management-level update permissions
- Executive-level administrative control

## Planned Future Expansions

- Realtime notifications
- Direct messaging
- File uploads
- Workspace analytics
- Audit evidence uploads
- Advanced ticket routing
- Employee evaluations
- Leave management
- Shift scheduling
- Internal Affairs systems
- RFN performance metrics
- Roblox integration
- Discord API integration

## Recommended Next Steps

1. Configure Firebase Authentication
2. Deploy Firestore Rules
3. Enable GitHub Pages
4. Create the first admin account
5. Add approved customer records
6. Test workspace verification
7. Begin Batch 8 development
