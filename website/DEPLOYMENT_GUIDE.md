# Complete Deployment Guide for Timeline Roadmap

This guide will walk you through hosting your Timeline Roadmap app online for the first time.

## Prerequisites

- Your SSH public key (already created): `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEHJOsWWmDtrrCLdsdYyP3ob/DCPSb02DJTtqVZSqeZ1 ross@timeline-roadmap`
- A credit/debit card for VPS payment (~$6/month)

---

## Part 1: Get a VPS (Virtual Private Server)

### Option A: DigitalOcean (Recommended for beginners)

1. **Sign up**: Go to [digitalocean.com](https://www.digitalocean.com) and create an account
2. **Create a Droplet**:
   - Click "Create" → "Droplets"
   - **Choose an image**: Ubuntu 22.04 LTS
   - **Choose a plan**: Basic ($6/month - 1GB RAM, 1 CPU, 25GB SSD)
   - **Choose a datacenter region**: Pick one close to you (e.g., London, New York)
   - **Authentication**: Select "SSH keys" and paste your public key:
     ```
     ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEHJOsWWmDtrrCLdsdYyP3ob/DCPSb02DJTtqVZSqeZ1 ross@timeline-roadmap
     ```
   - **Hostname**: `timeline-roadmap` (or whatever you prefer)
   - Click "Create Droplet"

3. **Wait 1-2 minutes** for the droplet to be created
4. **Note the IP address** shown (e.g., `123.45.67.89`)

### Option B: Hetzner (Cheaper - €4/month)

1. **Sign up**: Go to [hetzner.com](https://www.hetzner.com)
2. **Create a Cloud Server**:
   - Similar process to DigitalOcean
   - Choose Ubuntu 22.04
   - CX11 plan (€4/month)
   - Add your SSH key

---

## Part 2: Connect to Your VPS

Once your VPS is created, connect to it from your local computer:

```bash
# Replace YOUR_SERVER_IP with the IP address from DigitalOcean/Hetzner
ssh -i ~/.ssh/timeline_rsa root@YOUR_SERVER_IP
```

**First time connecting?** You'll see a message asking to verify the host. Type `yes` and press Enter.

---

## Part 3: Set Up the Server

Once connected to your VPS, run these commands one by one:

### 3.1: Update the system
```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3.3: Install PM2 (keeps your app running)
```bash
sudo npm install -g pm2
```

### 3.4: Install Nginx (web server)
```bash
sudo apt install -y nginx
```

### 3.5: Install FFmpeg (for video processing)
```bash
sudo apt install -y ffmpeg
```

### 3.6: Create application directory
```bash
sudo mkdir -p /var/www/timeline-roadmap
sudo chown -R $USER:$USER /var/www/timeline-roadmap
```

### 3.7: Configure firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

---

## Part 4: Deploy Your Application

### 4.1: Build your app locally (on your computer)

Open a **new terminal on your local computer** (don't close the SSH connection):

```bash
cd /home/ross/projects/a_timeline
npm install
npm run build:prod
```

### 4.2: Upload files to the server

Still on your local computer, run:

```bash
# Replace YOUR_SERVER_IP with your actual IP
rsync -avz -e "ssh -i ~/.ssh/timeline_rsa" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'data/backups/*' \
  /home/ross/projects/a_timeline/ \
  root@159.203.74.8:/var/www/timeline-roadmap/
```

### 4.3: Install dependencies on the server

Back in your **SSH terminal** (connected to the VPS):

```bash
cd /var/www/timeline-roadmap
npm install --production
```

### 4.4: Create environment file

```bash
cat > /var/www/timeline-roadmap/.env << 'EOF'
JWT_SECRET=b5e4d876b058031733be694fef44f0a76028afc749d62d3beb5ad8b45721129b
PORT=3001
NODE_ENV=production
EOF
```

### 4.5: Start the backend with PM2

```bash
cd /var/www/timeline-roadmap
pm2 start server.js --name timeline-backend
pm2 save
pm2 startup
```

**Note**: The last command will show you a command to run. Copy and paste it, then run it.

---

## Part 5: Configure Nginx

### 5.1: Create Nginx configuration

```bash
sudo tee /etc/nginx/sites-available/timeline << 'EOF'
server {
    listen 80;
    server_name _;

    # Serve static frontend files
    root /var/www/timeline-roadmap/dist;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve uploaded files
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Increase upload size limit
    client_max_body_size 50M;
}
EOF
```

### 5.2: Enable the site

```bash
sudo ln -sf /etc/nginx/sites-available/timeline /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Part 6: Test Your App!

Open your browser and go to: `http://YOUR_SERVER_IP`

You should see your Timeline Roadmap app! 🎉

**Default login**:
- Username: `ross`
- Password: `109Crawfordsburn`

---

## Part 7: Get a Domain Name (Optional but Recommended)

Instead of using an IP address, you can use a domain like `timeline.yourname.com`.

### 7.1: Buy a domain

- **Namecheap**: ~$10/year ([namecheap.com](https://www.namecheap.com))
- **Cloudflare**: ~$10/year ([cloudflare.com](https://www.cloudflare.com))
- **Google Domains**: ~$12/year

### 7.2: Point domain to your server

In your domain registrar's DNS settings, add an **A record**:
- **Type**: A
- **Name**: @ (or your subdomain)
- **Value**: YOUR_SERVER_IP
- **TTL**: 300

Wait 5-10 minutes for DNS to propagate.

### 7.3: Update Nginx configuration

```bash
sudo nano /etc/nginx/sites-available/timeline
```

Change the line:
```
server_name _;
```

To:
```
server_name yourdomain.com www.yourdomain.com;
```

Save (Ctrl+O, Enter, Ctrl+X) and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Part 8: Enable HTTPS (SSL Certificate)

### 8.1: Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2: Get SSL certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: yes)

**Done!** Your app is now accessible at `https://yourdomain.com` 🔒

---

## Updating Your App

When you make changes to your app:

### On your local computer:
```bash
cd /home/ross/projects/a_timeline
npm run build:prod
rsync -avz -e "ssh -i ~/.ssh/timeline_rsa" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'data' \
  /home/ross/projects/a_timeline/ \
  root@YOUR_SERVER_IP:/var/www/timeline-roadmap/
```

### On the server (via SSH):
```bash
cd /var/www/timeline-roadmap
npm install --production
pm2 restart timeline-backend
```

---

## Troubleshooting

### Check if backend is running:
```bash
pm2 status
pm2 logs timeline-backend
```

### Check Nginx status:
```bash
sudo systemctl status nginx
sudo nginx -t
```

### View Nginx error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Restart everything:
```bash
pm2 restart timeline-backend
sudo systemctl restart nginx
```

---

## Costs Summary

- **VPS**: $6/month (DigitalOcean) or €4/month (Hetzner)
- **Domain** (optional): ~$10/year
- **SSL Certificate**: FREE (Let's Encrypt)

**Total**: ~$6-7/month

---

## Next Steps

1. Change the default superadmin password
2. Set up regular backups (PM2 handles app restarts automatically)
3. Monitor your app with `pm2 monit`

**Need help?** Check the logs or reach out!





