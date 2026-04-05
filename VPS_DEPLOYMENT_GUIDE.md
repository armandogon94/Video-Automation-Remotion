# Deployment Guide for Hostinger VPS
## Production Setup for Armando's Video Pipeline

---

## DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOSTINGER VPS KVM2                       │
│                      (2 vCPU, 8GB RAM)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      systemd Services                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Remotion Dev │  │ Node.js API  │  │  Cron Jobs   │          │
│  │  :3000       │  │  :3333       │  │  (scheduled) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  MongoDB     │  │   Redis      │  │  File Queue  │          │
│  │  (optional)  │  │  (caching)   │  │  (job queue) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
           ↓
     ┌─────────────┐
     │  Workspace  │
     │  /tmp/ or   │ ← Video files, audio, SRT, output
     │  /mnt/data  │
     └─────────────┘
           ↓
     ┌─────────────┐
     │ CDN Upload  │ ← Cloudinary, AWS S3, etc.
     └─────────────┘
```

---

## STEP-BY-STEP DEPLOYMENT

### 1. SSH into Your VPS

```bash
ssh root@your-hostinger-ip-address

# Update system
apt-get update && apt-get upgrade -y

# Install basic tools
apt-get install -y curl wget git build-essential
```

### 2. Install Node.js 22 (LTS)

```bash
# NodeSource repository (v22)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Install Node.js and npm
apt-get install -y nodejs

# Verify
node --version  # Should be v22.x.x
npm --version   # Should be 10.x.x
```

### 3. Install Python 3 & pip

```bash
apt-get install -y python3 python3-pip python3-venv

# Verify
python3 --version
pip3 --version
```

### 4. Install FFmpeg

```bash
apt-get install -y ffmpeg

# Verify (check for libass support)
ffmpeg -version | grep libass
# Output should show: --enable-libass
```

### 5. Install ImageMagick (optional, for image processing)

```bash
apt-get install -y imagemagick
```

### 6. Clone Your Project Repository

```bash
cd /home

# Create app directory
mkdir -p video-pipeline
cd video-pipeline

# Initialize git or clone your repository
git clone https://github.com/yourusername/video-pipeline.git .

# Or initialize fresh:
# git init
```

### 7. Install Node Dependencies

```bash
npm install

# Install Remotion browser (Chromium)
npx remotion browser ensure

# This downloads ~250MB - can take 2-3 minutes
```

### 8. Install Python Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install packages
pip install faster-whisper pysrt requests python-dotenv

# Note: faster-whisper will download Whisper model (~500MB) on first use
```

### 9. Create Environment Variables File

```bash
# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
REMOTION_PORT=3000
API_PORT=3333
WORKSPACE=/mnt/data/workspace
TEMP_DIR=/mnt/data/workspace/temp
OUTPUT_DIR=/mnt/data/workspace/output
ELEVENLABS_API_KEY=sk_your_key_here
DEEPL_API_KEY=your_key_here
OPENAI_API_KEY=sk_your_key_here
EOF

# Secure the file
chmod 600 .env
```

### 10. Create Workspace Directories

```bash
mkdir -p /mnt/data/workspace/{temp,output,logs,completed}
chown -R nobody:nogroup /mnt/data/workspace
chmod -R 755 /mnt/data/workspace
```

---

## SYSTEMD SERVICES SETUP

### Service 1: Remotion Development Server

```bash
# Create systemd service
cat > /etc/systemd/system/remotion-dev.service << 'EOF'
[Unit]
Description=Remotion Development Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=nobody
WorkingDirectory=/home/video-pipeline
EnvironmentFile=/home/video-pipeline/.env
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
systemctl daemon-reload
systemctl enable remotion-dev.service
systemctl start remotion-dev.service

# Check status
systemctl status remotion-dev.service
```

### Service 2: Video Pipeline API Server

```bash
# Create API service
cat > /etc/systemd/system/video-pipeline-api.service << 'EOF'
[Unit]
Description=Video Pipeline API Server
After=remotion-dev.service
StartLimitIntervalSec=0

[Service]
Type=simple
User=nobody
WorkingDirectory=/home/video-pipeline
EnvironmentFile=/home/video-pipeline/.env
ExecStart=/usr/bin/node api.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="NODE_OPTIONS=--max_old_space_size=2048"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable video-pipeline-api.service
systemctl start video-pipeline-api.service
```

### Service 3: Cron Job Orchestrator (Optional)

```bash
# For scheduled video rendering
cat > /etc/systemd/system/video-pipeline-scheduler.service << 'EOF'
[Unit]
Description=Video Pipeline Scheduler
After=multi-user.target

[Service]
Type=oneshot
User=nobody
WorkingDirectory=/home/video-pipeline
EnvironmentFile=/home/video-pipeline/.env
ExecStart=/home/video-pipeline/scheduler.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable video-pipeline-scheduler.service
```

---

## NGINX REVERSE PROXY (Optional, for HTTPS)

```bash
# Install Nginx
apt-get install -y nginx certbot python3-certbot-nginx

# Create Nginx config
cat > /etc/nginx/sites-available/video-pipeline << 'EOF'
upstream remotion {
    server localhost:3000;
}

upstream video_api {
    server localhost:3333;
}

server {
    listen 80;
    server_name videos.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name videos.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/videos.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/videos.yourdomain.com/privkey.pem;

    # Remotion Studio
    location / {
        proxy_pass http://remotion;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_read_timeout 86400;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://video_api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Output directory (view completed videos)
    location /videos/ {
        alias /mnt/data/workspace/output/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/video-pipeline /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx

# Get SSL certificate
certbot certonly --nginx -d videos.yourdomain.com
```

---

## API SERVER (Node.js + Express)

Create `api.js`:

```javascript
const express = require('express');
const VideoPipeline = require('./pipeline');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

const pipeline = new VideoPipeline();
const PORT = process.env.API_PORT || 3333;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate video
app.post('/api/generate-video', async (req, res) => {
  const { script, title, subtitle, voice, accentColor } = req.body;

  if (!script || !title) {
    return res.status(400).json({
      error: 'Missing required fields: script, title',
    });
  }

  const jobId = `job_${Date.now()}`;

  res.json({
    status: 'queued',
    jobId: jobId,
    estimatedTime: '4-5 minutes',
  });

  // Run pipeline asynchronously
  (async () => {
    try {
      console.log(`[${jobId}] Starting pipeline...`);

      const outputs = await pipeline.run(script, title, {
        subtitle,
        voice: voice || 'es-ES-AlvaroNeural',
        accentColor: accentColor || '#00d4ff',
      });

      console.log(`[${jobId}] Complete:`, outputs);

      // Save job metadata
      const jobInfo = {
        jobId,
        status: 'complete',
        timestamp: new Date().toISOString(),
        outputs,
      };

      fs.writeFileSync(
        path.join(process.env.WORKSPACE, 'completed', `${jobId}.json`),
        JSON.stringify(jobInfo, null, 2)
      );
    } catch (error) {
      console.error(`[${jobId}] Error:`, error.message);
    }
  })();
});

// List completed videos
app.get('/api/videos', (req, res) => {
  const completedDir = path.join(process.env.WORKSPACE, 'completed');

  if (!fs.existsSync(completedDir)) {
    return res.json({ videos: [] });
  }

  const files = fs.readdirSync(completedDir);
  const videos = files
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(completedDir, f)));
      return data;
    });

  res.json({ videos });
});

// Download video
app.get('/api/videos/:jobId/:platform', (req, res) => {
  const { jobId, platform } = req.params;
  const filePath = path.join(
    process.env.OUTPUT_DIR,
    `${jobId}_${platform}.mp4`
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  res.download(filePath);
});

// Start server
app.listen(PORT, () => {
  console.log(`Video Pipeline API running on port ${PORT}`);
});
```

---

## SCHEDULED RENDERING (Cron Job)

Create `scheduler.sh`:

```bash
#!/bin/bash

# Scheduled video rendering script
# Run this daily at 11 PM via cron or systemd timer

set -e

source /home/video-pipeline/.env

cd /home/video-pipeline
source venv/bin/activate

# Load today's scripts from database or file
# Example: reading from a JSON queue

QUEUE_FILE="$WORKSPACE/queue.json"

if [ ! -f "$QUEUE_FILE" ]; then
  echo "No queue file found, exiting."
  exit 0
fi

# Process each item in queue
while IFS= read -r line; do
  script=$(echo "$line" | jq -r '.script')
  title=$(echo "$line" | jq -r '.title')

  echo "Processing: $title"

  node pipeline.js \
    --script "$script" \
    --title "$title"

done < <(jq -c '.videos[]' "$QUEUE_FILE")

echo "Scheduled rendering complete at $(date)"
```

Make it executable:
```bash
chmod +x /home/video-pipeline/scheduler.sh
```

Add to crontab:
```bash
# Edit crontab
crontab -e

# Add this line (run at 11 PM daily)
0 23 * * * /home/video-pipeline/scheduler.sh >> /home/video-pipeline/logs/scheduler.log 2>&1
```

---

## MONITORING & LOGGING

### Check Service Status

```bash
# Check all services
systemctl status remotion-dev.service
systemctl status video-pipeline-api.service

# View logs
journalctl -u remotion-dev.service -f
journalctl -u video-pipeline-api.service -f

# Combined logs
journalctl -u remotion-dev.service -u video-pipeline-api.service -n 100
```

### Monitor Resource Usage

```bash
# Real-time monitoring
top -b -n 1 | head -20

# Check memory
free -h

# Check disk
df -h /mnt/data

# Check CPU
cat /proc/cpuinfo | grep processor | wc -l
```

### Automated Cleanup Script

```bash
# Create cleanup job
cat > /home/video-pipeline/cleanup.sh << 'EOF'
#!/bin/bash

# Remove old temporary files (older than 7 days)
find /mnt/data/workspace/temp -type f -mtime +7 -delete

# Archive old outputs (older than 30 days)
find /mnt/data/workspace/output -type f -mtime +30 -exec gzip {} \;

# Keep disk space under 80%
# If disk > 80%, delete oldest outputs
USAGE=$(df /mnt/data | tail -1 | awk '{print $5}' | cut -d'%' -f1)

if [ $USAGE -gt 80 ]; then
  echo "Disk usage at ${USAGE}%, cleaning old files..."
  find /mnt/data/workspace/output -type f -printf '%T+ %p\n' | sort | head -20 | cut -d' ' -f2- | xargs rm -f
fi

echo "Cleanup complete at $(date)"
EOF

chmod +x /home/video-pipeline/cleanup.sh

# Add to crontab (run daily at 2 AM)
# 0 2 * * * /home/video-pipeline/cleanup.sh >> /home/video-pipeline/logs/cleanup.log 2>&1
```

---

## BACKUP STRATEGY

```bash
# Create backup directory
mkdir -p /mnt/backup

# Create backup script
cat > /home/video-pipeline/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/mnt/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/videos_backup_$DATE.tar.gz"

# Backup completed videos only (not temp files)
tar -czf "$BACKUP_FILE" \
  -C /mnt/data/workspace output/ \
  --exclude='*.tmp'

# Keep only last 3 backups
ls -t "$BACKUP_DIR"/videos_backup_*.tar.gz | tail -n +4 | xargs rm -f

echo "Backup complete: $BACKUP_FILE"
EOF

chmod +x /home/video-pipeline/backup.sh

# Backup weekly
# 0 0 * * 0 /home/video-pipeline/backup.sh >> /home/video-pipeline/logs/backup.log 2>&1
```

---

## PERFORMANCE TUNING FOR 2 vCPU/8GB

### System Configuration

```bash
# Increase file descriptors
cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# Reload
sysctl -p
```

### Remotion Configuration

In `remotion.config.ts` or `src/index.tsx`:

```typescript
// Set concurrency to 1 for VPS
export const DEFAULT_PROPS = {
  concurrency: 1,
  quality: 70, // 0-100
  scale: 1, // 1 = full quality
  jpegQuality: 80,
};
```

### Node.js Configuration

```bash
# Increase Node heap size (add to systemd service)
Environment="NODE_OPTIONS=--max_old_space_size=4096"
```

### Python Configuration

```python
# In whisper_transcribe.py
import os
os.environ['OMP_NUM_THREADS'] = '1'  # Use single CPU thread
os.environ['MKL_NUM_THREADS'] = '1'
```

---

## TESTING DEPLOYMENT

```bash
# Test services start correctly
systemctl restart remotion-dev.service
sleep 5
curl http://localhost:3000/  # Should return HTML

# Test API
systemctl restart video-pipeline-api.service
sleep 2
curl http://localhost:3333/health  # Should return JSON

# Test render pipeline
curl -X POST http://localhost:3333/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Hola mundo",
    "title": "Mi Video"
  }'

# Monitor progress
tail -f /var/log/syslog | grep -i video
```

---

## PRODUCTION CHECKLIST

- [ ] SSH key configured (no password login)
- [ ] Firewall configured (UFW: only 80, 443, 22)
- [ ] SSL certificate installed
- [ ] Services auto-start on reboot
- [ ] Logs rotate with logrotate
- [ ] Backup strategy in place
- [ ] Monitoring/alerting configured
- [ ] Disk space monitoring
- [ ] Memory monitoring
- [ ] CPU usage monitoring
- [ ] Error notifications working
- [ ] Load testing completed

---

## FIREWALL SETUP (UFW)

```bash
# Enable UFW
ufw enable

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Deny everything else
ufw default deny incoming
ufw default allow outgoing

# Check status
ufw status
```

---

## SECURITY HARDENING

```bash
# Disable root SSH login
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Disable password auth
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Restart SSH
systemctl restart sshd

# Install fail2ban
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Automatic security updates
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## DEPLOYMENT SUMMARY

**Total setup time:** 30-45 minutes
**Monthly cost:** $20 (VPS only, assuming free TTS)
**Video capacity:** 40-50 per month
**Time to first video:** ~5 minutes after initial setup

**Files deployed:**
- `/home/video-pipeline/` - Main application
- `/etc/systemd/system/` - Service definitions
- `/etc/nginx/sites-available/` - Reverse proxy
- `/mnt/data/workspace/` - Working directories

**Commands to remember:**
```bash
# Check status
systemctl status remotion-dev.service
systemctl status video-pipeline-api.service

# View logs
journalctl -u remotion-dev.service -f

# Test rendering
curl -X POST http://localhost:3333/api/generate-video -H "Content-Type: application/json" -d '{"script":"test","title":"test"}'

# Restart services
systemctl restart remotion-dev.service video-pipeline-api.service
```

You're ready to deploy! 🚀
