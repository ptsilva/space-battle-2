# 🚀 Space Battle - Epic Space Combat Game

An immersive browser-based space combat game built with TypeScript, HTML5 Canvas, and modern web technologies.

![Space Battle Game](https://images.pexels.com/photos/586030/pexels-photo-586030.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## 🎮 Features

### Core Gameplay
- **Player-controlled spaceship** with smooth movement mechanics
- **Three enemy types** with unique AI behaviors and attack patterns
- **Real-time combat** with projectile physics and collision detection
- **Wave-based progression** with increasing difficulty
- **Power-up system** with temporary boosts (health, shield, weapon, speed)

### Progression & Upgrades
- **Virtual currency system** - earn coins by defeating enemies
- **Upgrade shop** with 4 upgrade categories:
  - 🔫 **Weapon Enhancement** - Increase damage and fire rate
  - 🛡️ **Shield Technology** - Boost shield capacity and regeneration
  - ❤️ **Hull Reinforcement** - Increase maximum HP
  - ⚡ **Engine Boost** - Enhance movement speed
- **Persistent progression** - upgrades and coins saved between sessions

### User Experience
- **Cross-platform compatibility** - works on desktop and mobile
- **Responsive design** - adapts to screen sizes from 320px to 1920px+
- **Dual control schemes**:
  - **Desktop**: WASD/Arrow keys + Spacebar
  - **Mobile**: Touch controls with auto-fire
- **Local leaderboard** with score persistence
- **Sound effects** for shooting, explosions, and power-ups

### Technical Features
- **60fps performance** optimized for mobile devices
- **Particle effects** for explosions and visual feedback
- **Dynamic difficulty scaling** every 5 waves
- **LocalStorage persistence** for scores and progress
- **TypeScript** for type safety and better development experience

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/space-battle-game.git
cd space-battle-game

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Build the game
npm run build

# Preview production build
npm run preview
```

## 🎯 How to Play

### Desktop Controls
- **WASD** or **Arrow Keys**: Move spaceship
- **Spacebar**: Shoot
- **P**: Pause game
- **ESC**: Open menu

### Mobile Controls
- **Touch & Drag**: Move spaceship
- **Auto-fire**: Weapons fire automatically
- **Tap Menu Button**: Access pause and upgrades

### Gameplay Tips
- 💰 Collect coins by destroying enemies to purchase upgrades
- 🛡️ Your shield regenerates when not taking damage for 3 seconds
- ⚡ Power-ups provide temporary boosts - collect them strategically
- 📈 Higher waves give more coins and score multipliers
- 🎯 Different enemy types have unique behaviors - adapt your strategy

## 🏗️ Technical Architecture

### Project Structure
```
src/
├── game/
│   ├── entities/          # Game objects (Player, Enemy, Projectile, PowerUp)
│   ├── managers/          # System managers (Input, UI, Storage, Sound)
│   ├── effects/           # Visual effects (ParticleSystem)
│   ├── utils/             # Utilities (Vector2)
│   ├── types/             # TypeScript type definitions
│   └── Game.ts            # Main game class
├── styles/                # CSS styling
└── main.ts               # Application entry point
```

### Key Technologies
- **TypeScript** - Type-safe JavaScript development
- **HTML5 Canvas** - High-performance 2D rendering
- **Vite** - Fast build tool and development server
- **CSS3** - Modern styling with animations
- **Web APIs** - LocalStorage, Touch Events, Audio

## 🎨 Game Design

### Visual Style
- **Space theme** with gradient backgrounds and particle effects
- **Neon color palette** - cyan player, varied enemy colors
- **Orbitron font** for futuristic UI typography
- **Responsive HUD** with health, shield, and score displays

### Enemy Types
1. **Scout** (Red) - Fast, light, basic attacks
2. **Fighter** (Orange) - Balanced stats, moderate threat
3. **Heavy** (Pink) - Slow, heavily armored, high damage

### Power-Up Types
- 🟢 **Health** - Restore 30 HP
- 🔵 **Shield** - Restore 50 shield points
- 🔴 **Weapon** - Double damage for 10 seconds
- 🟡 **Speed** - 50% speed boost for 8 seconds

## 📱 Mobile Optimization

- **Touch-friendly controls** with intuitive drag movement
- **Auto-fire system** for simplified mobile gameplay
- **Responsive UI scaling** for various screen sizes
- **Performance optimization** to maintain 60fps on mobile devices
- **Battery-conscious** rendering and update loops

## 🏆 Scoring System

- **Base enemy values**: Scout (50), Fighter (100), Heavy (200)
- **Wave completion bonus**: Wave number × 100 points
- **Coin rewards**: 5-20 coins per enemy based on type
- **Persistent leaderboard** with local storage

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Adding Features
The modular architecture makes it easy to extend:
- Add new enemy types in `entities/Enemy.ts`
- Create new power-ups in `entities/PowerUp.ts`
- Implement new upgrade types in `types/GameTypes.ts`
- Add visual effects in `effects/ParticleSystem.ts`

## 🌟 Future Enhancements

- [ ] Multiplayer support
- [ ] Additional enemy types and boss battles
- [ ] More power-up varieties
- [ ] Achievement system
- [ ] Cloud save synchronization
- [ ] Weapon variety (spread shot, laser, missiles)
- [ ] Background music and enhanced audio
- [ ] Gamepad support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 🎮 Play Now

Experience the thrill of space combat! The game runs directly in your browser with no installation required.

---

**Built with ❤️ using TypeScript and HTML5 Canvas**
