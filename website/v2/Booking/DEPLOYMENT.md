# Deployment Guide

## Application URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://takoha-test.com/booking/ |
| **Local Dev** | http://localhost:3000/ |

## Production Environment

| Item | Value |
|------|-------|
| **Server** | Digital Ocean Droplet |
| **IP Address** | `159.203.74.8` |
| **Domain** | `www.takoha-test.com` |
| **App Path** | `/booking/` |
| **Web Server** | Nginx |
| **Deploy Path** | `/var/www/booking/` |
| **SSH User** | `root` |

---

## Quick Deploy (One Command)

From the project root, run:

```bash
npm run build && rsync -avz --delete build/ root@159.203.74.8:/var/www/booking/
```

Or use the deploy script:

```bash
npm run deploy
```

---

## Step-by-Step Deployment

### 1. Build the Application

```bash
npm run build
```

This creates a production build in the `build/` directory with base path `/booking/`.

### 2. Deploy to Server

```bash
rsync -avz --delete build/ root@159.203.74.8:/var/www/booking/
```

**Flags explained:**
- `-a` : Archive mode (preserves permissions, timestamps, etc.)
- `-v` : Verbose output
- `-z` : Compress during transfer
- `--delete` : Remove files on server that don't exist locally

### 3. Verify Deployment

Visit the production URL:
- https://www.takoha-test.com/booking/
- https://takoha-test.com/booking/

---

## Server Configuration

### Nginx Configuration

The Nginx config serves the static files from `/var/www/booking/`:

```nginx
# Serve the booking app at /booking
location /booking {
    alias /var/www/booking;
    index index.html;
    try_files $uri $uri/ /booking/index.html;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

This is configured in `/etc/nginx/sites-enabled/takoha-test` on the server.

### SSL Certificate

SSL is managed by Certbot (Let's Encrypt).

---

## SSH Access

### Test Connection

```bash
ssh root@159.203.74.8
```

### Check Deployed Files

```bash
ssh root@159.203.74.8 "ls -la /var/www/booking/"
```

### View Nginx Logs

```bash
ssh root@159.203.74.8 "tail -f /var/log/nginx/access.log"
ssh root@159.203.74.8 "tail -f /var/log/nginx/error.log"
```

### Restart Nginx (if needed)

```bash
ssh root@159.203.74.8 "systemctl restart nginx"
```

---

## Troubleshooting

### Build Fails

1. Ensure all dependencies are installed: `npm install`
2. Check for TypeScript errors: `npm run build`

### Deployment Fails

1. **SSH Permission Denied**: Ensure your SSH key is added to the server
   ```bash
   ssh-copy-id root@159.203.74.8
   ```

2. **rsync not found**: Install rsync locally
   ```bash
   sudo apt install rsync  # Ubuntu/Debian
   brew install rsync      # macOS
   ```

### Site Not Loading After Deploy

1. Check Nginx status:
   ```bash
   ssh root@159.203.74.8 "systemctl status nginx"
   ```

2. Check Nginx config syntax:
   ```bash
   ssh root@159.203.74.8 "nginx -t"
   ```

3. Check error logs:
   ```bash
   ssh root@159.203.74.8 "tail -50 /var/log/nginx/error.log"
   ```

### Clear Browser Cache

After deployment, if you don't see changes:
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open in incognito/private window

---

## Environment Notes

- This is a **static site** (Vite + React)
- No server-side rendering or backend on this droplet
- All API calls go to external services (Supabase)
- The `build/` folder contains all files needed for production
- Base path is configured as `/booking/` in `vite.config.ts`
