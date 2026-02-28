# Deployment Guide

This guide covers various deployment options for the Personal Finance Tracker application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment Options](#cloud-deployment-options)
  - [Heroku](#heroku)
  - [Railway](#railway)
  - [Vercel + Railway](#vercel--railway)
  - [AWS](#aws)
  - [DigitalOcean](#digitalocean)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Git repository with your code
- Node.js 18+ installed locally
- PostgreSQL 14+ (for local testing)
- Docker and Docker Compose (for containerized deployment)
- Account on chosen cloud platform

---

## Environment Configuration

### Production Environment Variables

**Backend (.env)**:
```env
NODE_ENV=production
PORT=5000
DB_HOST=<your-db-host>
DB_PORT=5432
DB_NAME=finance_tracker
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
FRONTEND_URL=<your-frontend-url>
```

**Frontend (.env)**:
```env
VITE_API_BASE_URL=<your-backend-api-url>
```

### Security Checklist

- [ ] Use strong database passwords
- [ ] Enable SSL/TLS for database connections
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS with specific frontend URL
- [ ] Use HTTPS for both frontend and backend
- [ ] Keep environment variables secure (never commit to git)
- [ ] Enable database backups
- [ ] Set up monitoring and logging

---

## Docker Deployment

### Local Docker Setup

1. **Create `.env` file in project root**:
```env
DB_PASSWORD=your_secure_password
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:5000/api
```

2. **Build and start containers**:
```bash
docker-compose up -d
```

3. **Run database migrations**:
```bash
docker-compose exec backend npm run migrate
```

4. **View logs**:
```bash
docker-compose logs -f
```

5. **Stop containers**:
```bash
docker-compose down
```

### Production Docker Deployment

For production, use a container orchestration platform:

- **Docker Swarm**: Built-in Docker orchestration
- **Kubernetes**: Enterprise-grade orchestration
- **AWS ECS**: Amazon's container service
- **Google Cloud Run**: Serverless containers

---

## Cloud Deployment Options

### Heroku

**Backend Deployment**:

1. **Install Heroku CLI**:
```bash
npm install -g heroku
```

2. **Login and create app**:
```bash
heroku login
heroku create finance-tracker-api
```

3. **Add PostgreSQL addon**:
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set environment variables**:
```bash
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-url.com
```

5. **Deploy backend**:
```bash
# From project root
git subtree push --prefix backend heroku main

# Or create a separate git repo for backend
cd backend
git init
heroku git:remote -a finance-tracker-api
git add .
git commit -m "Initial commit"
git push heroku main
```

6. **Run migrations**:
```bash
heroku run npm run migrate
```

**Frontend Deployment**:

Deploy frontend to Vercel or Netlify (see below).

---

### Railway

Railway provides easy deployment for both backend and database.

**Steps**:

1. **Install Railway CLI**:
```bash
npm i -g @railway/cli
```

2. **Login**:
```bash
railway login
```

3. **Initialize project**:
```bash
railway init
```

4. **Add PostgreSQL**:
```bash
railway add
# Select PostgreSQL
```

5. **Deploy backend**:
```bash
cd backend
railway up
```

6. **Set environment variables** in Railway dashboard:
- `NODE_ENV=production`
- `FRONTEND_URL=<your-frontend-url>`

7. **Run migrations**:
```bash
railway run npm run migrate
```

**Frontend**: Deploy to Vercel or Netlify.

---

### Vercel + Railway

**Backend on Railway** (see Railway section above)

**Frontend on Vercel**:

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy from frontend directory**:
```bash
cd frontend
vercel
```

3. **Set environment variable**:
```bash
vercel env add VITE_API_BASE_URL production
# Enter your Railway backend URL
```

4. **Deploy to production**:
```bash
vercel --prod
```

**Alternative**: Connect GitHub repo to Vercel dashboard for automatic deployments.

---

### AWS

**Architecture**:
- Frontend: S3 + CloudFront
- Backend: Elastic Beanstalk or ECS
- Database: RDS PostgreSQL

**Backend on Elastic Beanstalk**:

1. **Install EB CLI**:
```bash
pip install awsebcli
```

2. **Initialize EB**:
```bash
cd backend
eb init -p node.js-18 finance-tracker-api
```

3. **Create environment**:
```bash
eb create finance-tracker-prod
```

4. **Set environment variables**:
```bash
eb setenv NODE_ENV=production FRONTEND_URL=https://your-frontend-url.com
```

5. **Deploy**:
```bash
eb deploy
```

**Database on RDS**:

1. Create PostgreSQL instance in RDS console
2. Configure security groups
3. Update backend environment variables with RDS credentials
4. Run migrations:
```bash
eb ssh
cd /var/app/current
npm run migrate
```

**Frontend on S3 + CloudFront**:

1. **Build frontend**:
```bash
cd frontend
npm run build
```

2. **Create S3 bucket**:
```bash
aws s3 mb s3://finance-tracker-frontend
```

3. **Configure bucket for static hosting**:
```bash
aws s3 website s3://finance-tracker-frontend --index-document index.html
```

4. **Upload files**:
```bash
aws s3 sync dist/ s3://finance-tracker-frontend
```

5. **Create CloudFront distribution** in AWS console
6. **Invalidate cache after updates**:
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

### DigitalOcean

**App Platform Deployment**:

1. **Connect GitHub repository** in DigitalOcean dashboard
2. **Configure backend**:
   - Select `backend` folder
   - Build command: `npm run build`
   - Run command: `npm start`
   - Add environment variables
3. **Add PostgreSQL database** from dashboard
4. **Configure frontend**:
   - Select `frontend` folder
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add environment variable: `VITE_API_BASE_URL`
5. **Deploy**

**Droplet Deployment** (Manual):

1. **Create Ubuntu droplet**
2. **SSH into droplet**:
```bash
ssh root@your-droplet-ip
```

3. **Install dependencies**:
```bash
apt update
apt install -y nodejs npm postgresql nginx
```

4. **Clone repository**:
```bash
git clone <your-repo-url>
cd personal-finance-tracker
```

5. **Setup database**:
```bash
sudo -u postgres psql
CREATE DATABASE finance_tracker;
\q
```

6. **Setup backend**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with production values
npm run build
npm run migrate
```

7. **Setup PM2** (process manager):
```bash
npm install -g pm2
pm2 start dist/index.js --name finance-tracker-api
pm2 startup
pm2 save
```

8. **Setup frontend**:
```bash
cd ../frontend
npm install
npm run build
```

9. **Configure Nginx**:
```bash
nano /etc/nginx/sites-available/finance-tracker
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /root/personal-finance-tracker/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/finance-tracker /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

10. **Setup SSL with Let's Encrypt**:
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## Post-Deployment

### Database Migrations

Always run migrations after deployment:

```bash
# Heroku
heroku run npm run migrate

# Railway
railway run npm run migrate

# AWS EB
eb ssh
cd /var/app/current
npm run migrate

# Docker
docker-compose exec backend npm run migrate

# Manual server
cd backend
npm run migrate
```

### Verify Deployment

1. **Check health endpoint**:
```bash
curl https://your-backend-url/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Personal Finance Tracker API is running",
  "database": "connected"
}
```

2. **Test frontend**:
- Open browser to frontend URL
- Create a test transaction
- View dashboard
- Check all features work

3. **Check logs**:
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# AWS EB
eb logs

# Docker
docker-compose logs -f

# PM2
pm2 logs
```

---

## Monitoring

### Application Monitoring

**Recommended Tools**:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: APM
- **Datadog**: Infrastructure monitoring

**Setup Sentry** (example):

1. Install Sentry:
```bash
npm install @sentry/node @sentry/tracing
```

2. Configure in backend:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Database Monitoring

- Enable slow query logging
- Set up automated backups
- Monitor connection pool usage
- Track query performance

### Uptime Monitoring

**Free Options**:
- UptimeRobot
- Pingdom
- StatusCake

Configure to ping `/health` endpoint every 5 minutes.

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**

```bash
# Check database is running
# Heroku
heroku pg:info

# Railway
railway logs

# Verify credentials in environment variables
# Test connection
psql -h <host> -U <user> -d <database>
```

**2. CORS Errors**

- Verify `FRONTEND_URL` in backend matches actual frontend URL
- Check CORS configuration in `backend/src/index.ts`
- Ensure both HTTP/HTTPS protocols match

**3. Build Failures**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+

# Check for TypeScript errors
npm run build
```

**4. Migration Errors**

```bash
# Check database connection
# Verify migrations haven't already run
# Check migration files for syntax errors
# Run migrations manually
psql -U <user> -d <database> -f database/setup.sql
```

**5. Frontend Not Loading**

- Check browser console for errors
- Verify `VITE_API_BASE_URL` is correct
- Check network tab for failed API calls
- Clear browser cache
- Rebuild frontend: `npm run build`

### Rollback Procedure

**Heroku**:
```bash
heroku releases
heroku rollback v123
```

**Railway**:
- Use Railway dashboard to rollback to previous deployment

**AWS EB**:
```bash
eb deploy --version <previous-version>
```

**Docker**:
```bash
docker-compose down
git checkout <previous-commit>
docker-compose up -d
```

---

## Backup and Recovery

### Database Backup

**Automated Backups**:
- Heroku: Automatic with paid plans
- Railway: Automatic backups included
- AWS RDS: Configure automated backups
- DigitalOcean: Enable automated backups

**Manual Backup**:
```bash
# Local backup
pg_dump -U postgres finance_tracker > backup_$(date +%Y%m%d).sql

# Heroku backup
heroku pg:backups:capture
heroku pg:backups:download

# Restore
psql -U postgres finance_tracker < backup.sql
```

### Application Backup

- Keep git repository up to date
- Tag releases: `git tag v1.0.0`
- Store environment variables securely (1Password, AWS Secrets Manager)

---

## Performance Optimization

### Backend

- Enable gzip compression
- Implement caching (Redis)
- Optimize database queries
- Use connection pooling
- Enable CDN for static assets

### Frontend

- Enable code splitting
- Lazy load routes
- Optimize images
- Use CDN for assets
- Enable service worker for PWA

### Database

- Add appropriate indexes
- Analyze slow queries
- Optimize table structure
- Regular VACUUM operations
- Monitor connection pool

---

## Security Hardening

### Backend

- [ ] Use HTTPS only
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable helmet.js
- [ ] Set security headers
- [ ] Regular dependency updates
- [ ] Implement authentication (future phase)

### Database

- [ ] Use strong passwords
- [ ] Enable SSL connections
- [ ] Restrict network access
- [ ] Regular security patches
- [ ] Audit logging
- [ ] Backup encryption

### Frontend

- [ ] Content Security Policy
- [ ] XSS protection
- [ ] CSRF protection (future phase)
- [ ] Secure cookies (future phase)
- [ ] Regular dependency updates

---

## Cost Estimation

### Free Tier Options

- **Heroku**: Free dyno + mini PostgreSQL (~$7/month)
- **Railway**: $5/month credit (enough for small apps)
- **Vercel**: Free for personal projects
- **Netlify**: Free for personal projects

### Paid Options

- **Heroku**: $7-25/month (hobby/professional)
- **Railway**: $5-20/month
- **AWS**: $20-50/month (t3.micro + RDS)
- **DigitalOcean**: $12-24/month (droplet + database)

### Recommendations

- **Development/Testing**: Railway or Heroku free tier
- **Small Production**: Railway or DigitalOcean
- **Enterprise**: AWS or Google Cloud with auto-scaling

---

## Support

For deployment issues:
1. Check application logs
2. Review this troubleshooting guide
3. Check platform-specific documentation
4. Open an issue in the repository

---

**Last Updated**: February 2026
