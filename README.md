# 🌌 Cyber-Vault Loot Box System

<div align="center">
  <img width="1200" height="475" alt="Cyber-Vault Banner" src="public/assets/images/banner.png" />
</div>

Cyber-Vault is a high-fidelity Web3 gaming asset decryption platform built on the **Sui Network**. Experience the thrill of unboxing tactical gear and legendary artifacts in a stunning cyberpunk environment.

## 🚀 Features

- Sui Asset Decryption: Securely purchase and open loot boxes on the Sui blockchain.
- Dynamic Inventory: Manage your digital arsenal with detailed item statistics and rarity-based categorization.
- Artifact Arsenal: High-fidelity UI for inspecting items like the **Legendary Plasma Katana** and **Epic Aegis Core**.
- **Smooth Navigation**: implemented **Framer Motion** for buttery smooth page transitions and cross-fades.
- **Enhanced Visibility**: Optimized button states and contrast for consistent viewing across dark themes.
- **Layout Integrity**: Fixed routing-based jitter and layout shifts for a more stable browsing experience.
- Cyberpunk Aesthetics: A premium, dark-themed UX with vibrant gold and amber accents.
- Legendary Pity System: Guaranteed high-tier drops after a set number of decryptions.

## 🛠️ Tech Stack

- Frontend: React + Vite
- Styling: Tailwind CSS V4 (Vanilla CSS fallback)
- Animations: Framer Motion (via `motion/react`)
- Blockchain: Sui SDK (`@mysten/dapp-kit`, `@mysten/sui`)
- Icons: Lucide React

## 📦 Project Structure

```bash
├── contract/             # Sui Move smart contracts
├── public/               # Static assets (AI-generated card art)
│   └── assets/images/    # Tactical gear and item textures
├── src/
│   ├── components/       # Reusable UI components (Header, Layout, etc.)
│   ├── pages/            # Core views (Purchase, Inventory, Rewards, Leaderboard)
│   ├── ux/               # Business logic and state management
│   ├── App.tsx           # Route definitions
│   └── index.css         # Global design system & Tailwind layers
└── vite.config.ts        # Build and dev server configuration
```

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS)
- A Sui Wallet (e.g., Martian, Sui Wallet)

### Local Development

1. **Clone the repository**:

   ```bash
   git clone <your-repo-url>
   cd cyber-vault-loot-box-system
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file (copy from `.env.example` if available).

   ```bash
   cp .env.example .env
   ```

4. **Run the application**:

   ```bash
   npm run dev
   ```

5. **Build for production**:

   ```bash
   npm run build
   ```

---

*Built with high-fidelity for the Sui Loot Box Hackathon.*
