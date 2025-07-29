# Fundamental Dashboard - Crypto GitHub Activity Tracker

A React-based dashboard for tracking GitHub development activity across 150 cryptocurrency projects, with a focus on fundamental analysis of fast-growing altcoins.

## Features

- **Real-time GitHub Activity Tracking**: Monitor commit activity, contributors, and development progress
- **144 Cryptocurrency Projects**: Comprehensive coverage from Bitcoin to emerging altcoins (only projects with GitHub repos)
- **Fast-Growing Altcoin Focus**: Special highlighting of projects ranked 51-150 with high development activity
- **Interactive Charts**: Visual representation of development activity using Chart.js
- **Advanced Filtering**: Filter by project category (DeFi, Layer 1, Layer 2, etc.)
- **Project Details Modal**: In-depth information about each project including use cases and key features
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Open in browser**:
   ```
   http://localhost:3009
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.js       # Main header with title
│   ├── Controls.js     # Search, filter, and sort controls
│   ├── StatsGrid.js    # Statistics overview cards
│   ├── ActivityChart.js # Bar chart of most active projects
│   ├── CryptoGrid.js   # Grid layout for project cards
│   ├── CryptoCard.js   # Individual project card
│   └── ProjectModal.js # Detailed project information modal
├── data/               # Static data files
│   ├── cryptoProjects.js      # List of 150 crypto projects
│   └── projectDescriptions.js # Detailed descriptions
├── services/           # API and data services
│   └── githubService.js # GitHub API integration
└── App.js             # Main application component
```

## Key Altcoins to Watch (Rank 51-150)

The dashboard highlights fast-growing altcoins that show strong fundamental metrics:

- **Arweave (AR)** - Permanent storage protocol
- **Mina Protocol (MINA)** - World's lightest blockchain
- **GMX** - Decentralized perpetual exchange
- **Blur (BLUR)** - Professional NFT marketplace
- **Celestia (TIA)** - Modular blockchain network
- **Kaspa (KAS)** - High-speed PoW blockchain
- **Render (RENDER)** - Distributed GPU network
- **Arbitrum (ARB)** - Leading Ethereum Layer 2
- **Optimism (OP)** - Ethereum scaling solution
- **Jupiter (JUP)** - Solana DEX aggregator
- **Sei (SEI)** - Trading-optimized Layer 1
- **Injective (INJ)** - Cross-chain DeFi protocol
- **Movement (MOVE)** - Modular blockchain framework

## Technologies Used

- **React 18** - UI framework
- **Chart.js** - Data visualization
- **Lucide React** - Icons
- **CSS3** - Styling with gradients and animations

## Docker Deployment

To run with Docker:

```bash
# Build the image
docker build -t fundamental-dashboard .

# Run the container
docker run -p 3009:3009 fundamental-dashboard
```

## API Integration

The dashboard uses real GitHub API data with a pre-configured access token. The API fetches:
- Commit activity for each project
- Number of contributors
- Stars and forks count
- Last commit date
- Weekly commit history

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the Field Elevate trading dashboard ecosystem.