# 🛡️ AeroShield — GenAI Urban Air Defense Copilot
> **PromptWars: Virtual Challenge — Challenge 6: Urban Air Quality Assistant**
> *Helping families and communities navigate severe winter smog through low-emission routines, DIY indoor air hacks, and quantified personal & collective defense.*

[![AeroShield CI](https://github.com/your-username/aeroshield/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/aeroshield/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Scientific Rigor](https://img.shields.io/badge/Models-EPA%20%7C%20WHO%20%7C%20UC%20Davis-10b981.svg)](https://www.epa.gov)

---

## 🌟 Executive Summary & Problem Context

Every winter, millions of families in global urban centers (such as Delhi NCR, Lahore, Krakow, Salt Lake City, and Beijing) are choked by severe seasonal smog. Nocturnal **thermal radiation inversions** compress the atmospheric mixing height to below 150 meters, trapping toxic combustion particles (PM2.5, PM10, $\text{NO}_2$) near breathing zones. 

Most conventional air quality apps fail users by merely displaying an abstract, alarming color index ("AQI 420 - Hazardous") with unhelpful or expensive advice ("Buy an $800 purifier", "Stay inside").

**AeroShield** is a production-grade, multi-agent GenAI urban air defense copilot designed to solve this crisis. Instead of passive alerts, AeroShield:
1. **Capitalizes on Atmospheric Physics:** Identifies diurnal solar dispersion windows to re-schedule high-risk outdoor activities.
2. **Quantifies Real Biological Impact:** Translates ambient $\mu g/m^3$ readings into exact **inhaled fine particulate dosage ($\mu g$)** and **cigarette equivalents avoided** for every family member.
3. **Democratizes Indoor Air (IAQ):** Features an interactive **Corsi-Rosenthal Box Purifier Studio**, guiding families to build CDC hospital-grade ($>500 \text{ m}^3/\text{hr}$ CADR) air cleaners for under $75 (saving $375+ vs commercial units).
4. **Mobilizes Neighborhoods:** Orchestrates collective anti-idling school zones and carpooling pledges, calculating cumulative particulate abatement for the local airshed.

---

## 🏆 Competitive Differentiation: Why AeroShield Wins

| Feature / Criteria | Average Candidate Submissions | **AeroShield (Winning Architecture)** |
| :--- | :--- | :--- |
| **GenAI Depth** | Single static chat prompt ("*Give tips for smog*"). | **5-Agent Cooperative Architecture** (*AeroSense, PulmoGuard, EcoShift, SanctuaryAI, CommunityShield*). |
| **Air Quality Data** | Hardcoded mock numbers or static single value. | **Live Global Real-Time & Hourly Forecast Ingestion** (Open-Meteo Air Quality API across global coordinates). |
| **Behavioral Routines** | Vague advice ("*stay indoors*", "*avoid cars*"). | **Diurnal Boundary Layer Inversion Rescheduler**: Shifts morning commutes and workouts to afternoon solar dispersion troughs. |
| **Indoor Solutions** | Recommends purchasing $500+ commercial purifiers. | **Interactive Corsi-Rosenthal DIY Studio**: Dynamic CADR, ACH, and cost calculator validated by UC Davis aerosol science. |
| **Impact Quantification** | Vague claims ("*Good for the environment*"). | **Dual Mathematical Models**: Computes physical $\mu g$ PM2.5 lung dosage reduction + grams of PM2.5 & kg of $\text{CO}_2$ abated. |
| **Community Aspect** | Ignored completely (single-user focus). | **Community Defense Hub**: Collective pledges, school anti-idle zones, and neighborhood particulate reduction leaderboards. |
| **Engineering Rigor** | Quick un-typed prototype, no tests, broken deploy. | **100% Typed TypeScript**, Vitest unit test suite, GitHub Actions CI, and 1-click Vercel deployment. |

---

## 🔬 Scientific & Mathematical Models

### 1. Personal Lung Inhalation Dosage Model (EPA Exposure Factors)
Unlike abstract AQI, AeroShield calculates the physical particulate mass deposited into human airways:

$$\text{Inhaled Dosage } (\mu g) = \sum_{i=1}^{n} \left( C_i \times V_{E,\text{activity}} \times t_i \times (1 - \eta_{\text{filter}}) \right)$$

- $C_i$: Ambient hourly particulate concentration ($\mu g / m^3$).
- $V_{E,\text{activity}}$: Minute ventilation rate ($m^3 / \text{min}$, e.g. 0.012 for children, 0.016 for adults, up to 0.055 for heavy outdoor exertion).
- $t_i$: Duration of outdoor exposure in minutes.
- $\eta_{\text{filter}}$: Certified particulate filtration efficiency (0% None, 30% Cloth, 70% Surgical, 95% N95/FFP2).

### 2. Corsi-Rosenthal Clean Air Delivery Rate (CADR) & Room ACH
Validating the performance of open-source DIY 4-to-5 filter cube purifiers:

$$\text{CADR}_{\text{DIY}} = Q_{\text{effective}} \times \eta_{\text{filter}}$$

$$\text{ACH} = \frac{\text{CADR } (m^3/\text{hr})}{\text{Room Volume } (m^3)}$$

AeroShield ensures every configured room achieves $\ge 5.0\text{ ACH}$ (Air Changes per Hour), meeting **CDC and ASHRAE 241** infection and particulate control guidelines.

### 3. Berkeley Earth Cigarette Equivalence
Translates toxic inhaled microgram particulate burden into equivalent cigarettes avoided:

$$\text{Cigarettes Avoided} = \frac{\Delta \text{Dosage } (\mu g)}{200 \mu g/\text{cigarette}}$$

---

## 🤖 Multi-Agent Orchestration Architecture

```mermaid
flowchart TD
    subgraph Data Layer
        A1["Live Open-Meteo Air Quality API\n(PM2.5, PM10, NO2, AQI, Inversion)"]
        A2["Global Geocoding & City Hotspots\n(Delhi, Lahore, Salt Lake City, Beijing, etc.)"]
        A3["Family Profiles & Lifestyle Inputs\n(Kids/Asthma, Elderly, Commuters, Room Sizes)"]
    end

    subgraph Agentic Reasoning Core
        B1["AeroSense Ingestion Agent\n(Diurnal curves & smog forecast)"]
        B2["PulmoGuard Dosage Agent\n(Mathematical lung particulate mass)"]
        B3["EcoShift Routine Planner\n(Diurnal schedule optimization & green transit)"]
        B4["SanctuaryAI IAQ Studio\n(Corsi-Rosenthal CADR & smart ventilation)"]
        B5["CommunityShield Coordinator\n(Neighborhood pledges & collective impact)"]
    end

    subgraph User Experience
        C1["Live Smog Radar & 24h Diurnal Slider"]
        C2["Smart Daily Routine (Before vs. After Comparison)"]
        C3["Interactive DIY Corsi-Rosenthal Builder & CADR Calculator"]
        C4["Personal Health Dosage & Emission Savings Dashboard"]
        C5["Community Smog Defense Hub & Action Leaderboard"]
    end

    A1 & A2 --> B1
    A3 & B1 --> B2 & B3 & B4
    B3 & B4 --> B5
    B1 --> C1
    B2 & B3 --> C2
    B4 --> C3
    B2 & B3 & B5 --> C4
    B5 --> C5
```

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js 18+ (tested on Node v20 & v24)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/your-username/aeroshield.git
cd aeroshield
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Scientific Test Suite
```bash
npm run test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 1-Click Production Deployment (Vercel)

AeroShield is optimized for zero-config deployment on Vercel or Netlify:
1. Push your repository to GitHub.
2. Import repository in [Vercel](https://vercel.com).
3. Framework Preset: **Vite**.
4. Click **Deploy**. Your app will be live with full HTTPS in under 60 seconds!

---

## 👥 Hackathon Submission Checklist (PromptWars: Virtual Challenge)
- [x] **Live Technical Deployment:** Fast, mobile-responsive, production web application.
- [x] **Public GitHub Repository:** Clean code, TypeScript, comprehensive README, MIT license.
- [x] **Agentic AI Architecture:** 5 specialized agents collaborating on telemetry, dosage, routines, IAQ, and community impact.
- [x] **Quantified Impact:** Exact particulate mass ($\mu g$), emissions prevented ($g$ PM2.5 / $kg$ $\text{CO}_2$), and Berkeley Earth cigarette equivalence.
- [x] **CI/CD Pipeline:** Fully configured GitHub Actions automated build and test runner.
