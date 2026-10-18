# 🏥 Smart Health: AI-Driven Health Center & Supply Chain Management

[![Live Web App](https://img.shields.io/badge/Live_Demo-Google_Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://smart-health-phc-1033914476348.asia-south1.run.app/)
[![GitHub Repo](https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/the-aryan-1712/smart-health-phc)
[![LinkedIn Post](https://img.shields.io/badge/Project_Update-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/feed/update/urn:li:activity:7517499489264332800/)

> An AI-powered management system built for rural Primary Health Centres (PHCs) and Community Health Centres (CHCs). It prevents medicine stockouts, speeds up emergency patient triage with Google Gemini AI, shows live bed availability, and tracks doctor attendance across district health centers.

---

## 🔗 Quick Links

Here are all the key links for this project:

- 🚀 **Live Demo on Google Cloud Run:** [https://smart-health-phc-1033914476348.asia-south1.run.app/](https://smart-health-phc-1033914476348.asia-south1.run.app/)
- 💻 **GitHub Repository:** [https://github.com/the-aryan-1712/smart-health-phc](https://github.com/the-aryan-1712/smart-health-phc)
- 📢 **LinkedIn Project Update:** [View the LinkedIn Post & Discussion](https://www.linkedin.com/feed/update/urn:li:activity:7517499489264332800/)

### 🧭 Direct Page Links (Live App)
- [🗺️ District Command Center](https://smart-health-phc-1033914476348.asia-south1.run.app/district) — Bird's-eye view of all health centers in the district
- [💊 Medicine Supply & Stockout Alerts](https://smart-health-phc-1033914476348.asia-south1.run.app/supply) — Inventory tracking and AI burn-rate forecasting
- [🩺 Patient Queue & AI Triage](https://smart-health-phc-1033914476348.asia-south1.run.app/patients) — OPD queue tracker with Gemini symptom triage
- [🛏️ Real-Time Bed Tracker](https://smart-health-phc-1033914476348.asia-south1.run.app/beds) — Live status of ICU, oxygen, general, and maternity beds
- [👨‍⚕️ Doctor & Staff Roster](https://smart-health-phc-1033914476348.asia-south1.run.app/staff) — Staff check-ins and unannounced absence reporting

---

## ❓ What Problem Does This Solve?

In many rural areas, government health clinics face 4 daily struggles:
1. **Running out of essential medicines:** Doctors discover medicines like insulin, anti-rabies, or antibiotics are finished only when a patient urgently needs them.
2. **Long, unorganized patient lines:** Nurses have trouble deciding who needs to see the doctor immediately versus who can safely wait.
3. **No idea where empty beds are:** When an emergency patient arrives needing oxygen or an ICU bed, staff waste precious minutes calling neighboring clinics one by one.
4. **Missing doctors:** If a doctor is absent without warning, the clinic stops running and district officers only find out days later.

**Smart Health fixes all of this** on a single, easy-to-use digital dashboard powered by AI.

---

## ✨ Key Features (Explained Simply)

### 1. 💊 Medicine Supply & Stockout Prediction
- **Know before you run out:** The system calculates daily medicine usage ("burn rate") and tells you exactly how many days of stock you have left.
- **Color-coded alerts:** Red for critical shortage, Yellow for low, Green for safe.
- **Emergency transfers:** Easily request medicine transfers from a nearby health center with surplus stock.
- **Gemini AI helper:** Automatically drafts purchase orders and explains why a medicine is depleting faster than usual.

### 2. 🩺 Patient Queue & AI Triage
- **Priority-based queue:** Uses the Manchester Triage standard (P1 Immediate to P4 Non-urgent) so life-threatening cases are seen first.
- **Google Gemini Triage Assistant:** Healthcare workers can type patient symptoms or chief complaints, and Gemini recommends the right urgency level and immediate care steps.
- **Live wait times:** Patients and nurses see estimated waiting times based on how many doctors are on duty.

### 3. 🛏️ Real-Time Bed Availability
- **Live bed map:** See which beds are Free, Occupied, or Under Cleaning with a single click.
- **Bed categories:** Filter by General, ICU, Oxygen-supported, and Maternity beds.
- **Smart referrals:** If your facility is full (>90% capacity), the app shows you which nearby health center has open beds ready.

### 4. 👨‍⚕️ Doctor & Staff Attendance Roster
- **Easy check-in:** Staff can clock in and out with one click.
- **Absence alerts:** If a critical staff member (like the only doctor on shift) hasn't checked in, an alert is triggered right away.
- **Automated incident reports:** Gemini AI drafts a formal absence incident log with one click, ready for review.

### 5. 🗺️ District Command Center (Vidarbha Health Corridor)
- **District health officers** can monitor all 8 rural centers across Wardha and Yavatmal on one unified screen.
- **Interactive map:** Visual indicators for each clinic's operational strain.
- **AI Executive Briefing:** Click one button to get an executive summary of district health emergencies generated by Gemini AI.

---

## 🛠️ How It Was Built (Tech Stack)

- **Frontend:** Next.js 16 (React 19, TypeScript) — Fast, modern, and mobile-friendly.
- **Design & Styling:** Tailwind CSS v4 — Clean dark-mode interface built with high contrast and accessible design (WCAG 2.1 AA compliant).
- **AI Brain:** Google Gemini API (`gemini-2.5-flash`) — Handles symptom triage, stock prediction explanations, and automated incident drafting.
- **Backend:** FastAPI (Python 3.11) — Fast asynchronous microservice for AI processing.
- **Deployment:** Docker & Google Cloud Run — Everything runs smoothly in a single production container managed by Supervisord.

---

## 🏃 Quick Start (Run Locally in 3 Steps)

### Step 1: Clone the repository
```bash
git clone https://github.com/the-aryan-1712/smart-health-phc.git
cd smart-health-phc
```

### Step 2: Set your API Key
Copy the example environment file and add your [Google Gemini API Key](https://aistudio.google.com/):
```bash
cp .env.local.example .env.local
```
Inside `.env.local`, set:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### Step 3: Run with Docker
```bash
docker build -t smart-health-phc .
docker run -p 8080:8080 -e GEMINI_API_KEY="your-gemini-api-key" smart-health-phc
```
Open [http://localhost:8080](http://localhost:8080) in your web browser!

---

## 🧪 Testing

All critical business logic (burn rate, triage scoring, attendance tracking) is covered with unit tests:

```bash
cd frontend
npm test
```
*30 passing unit tests with 100% test pass rate.*

---

## 👨‍💻 Project Links Summary

- **Live Web App:** [smart-health-phc-1033914476348.asia-south1.run.app](https://smart-health-phc-1033914476348.asia-south1.run.app/)
- **GitHub Repository:** [the-aryan-1712/smart-health-phc](https://github.com/the-aryan-1712/smart-health-phc)
- **LinkedIn Announcement:** [LinkedIn Post](https://www.linkedin.com/feed/update/urn:li:activity:7517499489264332800/)
