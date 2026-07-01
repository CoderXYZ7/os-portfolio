#!/usr/bin/env bash
# Run this ONCE on the remote server to set up nginx + Let's Encrypt SSL.
# Usage: sudo bash setup-ssl.sh bsl.mywire.org
set -e

DOMAIN="${1:-bsl.mywire.org}"
BACKEND_PORT=4443
NGINX_CONF="/etc/nginx/sites-available/portfolio"

echo "[ssl-setup] Domain: $DOMAIN → proxying to localhost:$BACKEND_PORT"

# ── Install nginx + certbot ──────────────────────────────────────────────────
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx

# ── Kill whatever is currently squatting on port 443 ────────────────────────
echo "[ssl-setup] Freeing port 443..."
fuser -k 443/tcp 2>/dev/null || true
sleep 1

# ── Write nginx config (HTTP only first, certbot will upgrade it) ────────────
cat > "$NGINX_CONF" << NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Let certbot prove domain ownership
    location /.well-known/acme-challenge/ { root /var/www/html; }

    # Proxy everything else to the portfolio Node.js server
    location / {
        proxy_pass         http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_read_timeout 3600s;
    }
}
NGINX

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/portfolio
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── Get Let's Encrypt certificate ────────────────────────────────────────────
echo "[ssl-setup] Obtaining SSL certificate for $DOMAIN..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email badsiliconlabs@gmail.com --redirect

# ── Final nginx config with WebSocket support added back ────────────────────
cat > "$NGINX_CONF" << NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name $DOMAIN;

    ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass         http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_read_timeout 3600s;
    }
}
NGINX

nginx -t && systemctl reload nginx

# ── Enable nginx on boot ─────────────────────────────────────────────────────
systemctl enable nginx

echo ""
echo "  Done. https://$DOMAIN/portfolio should now work."
echo ""
echo "  Start the portfolio server (in a separate terminal or via systemd):"
echo "    cd ~/portfolio/os-portfolio && sudo ./start.sh"
echo ""
