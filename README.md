# DeathStar Project

A NAS management system running on Synology DS423+ with Docker containers.

## Services

### qBittorrent
- Web UI: http://192.168.50.92:8080
- Credentials: kevin/kevin
- Configuration: /volume1/data/configs/qbittorrent
- Downloads: /volume1/data/torrents

### Web Portal
- URL: http://192.168.50.92:3000
- Provides a unified interface for managing NAS services
- Integrates with qBittorrent for torrent management

## Setup

1. Clone the repository:
```bash
git clone git@github.com:ksylvain77/DeathStar-Project.git
cd DeathStar-Project
```

2. Start the services:
```bash
docker-compose up -d
```

## Development

The web portal is built with Node.js and Express. To modify the web portal:

1. Navigate to the web-portal directory:
```bash
cd web-portal
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Configuration

- All configuration files are stored in `/volume1/data/configs/`
- Docker compose file manages all service configurations
- Environment variables can be modified in docker-compose.yml 