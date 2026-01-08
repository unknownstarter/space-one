# Space One 🚀

**Updated:** 2026-01-08

## 1. Product Requirements Document (PRD)

### **Game Overview**
**Space One** is a high-intensity, mobile-first web survival game. Players pilot the "MK-IV Interceptor" to survive as long as possible against infinite waves of asteroids and tracking missiles.

### **Key Features**
-   **Core Loop**: Dodge enemies -> Survive -> Score increases over time.
-   **Controls**:
    -   **Mobile**: Virtual Joystick (Drag anywhere).
    -   **Desktop**: Arrow Keys.
-   **Progression**: Local High Score + Firebase Leaderboard (Top 10).
-   **Monetization**:
    -   **Banner Ads**: Visible on screens with content (Home, Loading, Game Over).
    -   **Revive System**: Players can watch a Reward Ad (Interstitial-simulation) to revive once per session.

### **AdSense Policy Compliance**
-   **Valuable Content Rule**: Ads are strictly disabled on empty screens.
-   **Home Screen**: Enriched with "Lore / Tips" to justify ad placement.
-   **Loading Screen**: Enriched with "System Checks & Tips".

---

## 2. Developer Rules

### **Tech Stack**
-   **Engine**: Phaser 3 (TypeScript)
-   **Build Tool**: Vite
-   **Backend**: Firebase (Firestore) for Leaderboard.

### **Coding Standards**
1.  **Strict Typing**: No explicit `any` unless absolutely necessary (e.g., window.adsbygoogle).
2.  **Mobile First**: UI must scale dynamically. Test on widths < 600px.
3.  **Ad Safety**:
    -   **NEVER** use `display:block` for ads on initial HTML load.
    -   **ALWAYS** use `AdManager.hideBanner()` when transitioning to gameplay.
    -   **ALWAYS** ensure text content exists near any ad unit.

### **Deployment**
-   **Push to Main**: Triggers Vercel/GitHub Pages build (assuming configured).
-   **Manual Ad ID Update**: Requires code change in `src/scenes` if AdSense IDs change.

---

## 3. Ad Settings (2026-01-08)

**Publisher ID**: `pub-1886599828759613`

### **Ad Units**
| Placement | Type | Slot ID | Location |
| :--- | :--- | :--- | :--- |
| **Bottom Banner** | Display (Horizontal) | `3614039774` | Home, Loading, Game Over |
| **Revive Popup** | Display (Rectangle) | `5878909333` | Revive Popup (Fake Interstitial) |

### **Integration Logic**
-   **Banner**: Managed via `src/sdk/AdManager.ts`. Injected into `#ad-banner-bottom`.
-   **Revive**: Injected as an HTML DOM Element within the Phaser scene.

---

*Verified and Documented by Antigravity Agent.*
