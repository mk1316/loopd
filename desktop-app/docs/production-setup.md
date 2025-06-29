# 🚀 Production Setup Guide - Supabase

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file for production deployment:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Security Considerations

1. **Environment Variables**
   - Never commit `.env.production` to version control
   - Use secure environment variable management in your deployment platform
   - Rotate keys regularly

2. **Supabase Dashboard Settings**
   - Enable email confirmation for new users
   - Configure allowed redirect URLs for your production domain
   - Set up proper CORS settings
   - Enable rate limiting

3. **Database Security**
   - Review and test RLS policies
   - Set up database backups
   - Monitor for suspicious activity

## Deployment Checklist

### Pre-Deployment
- [ ] Test authentication flow in production environment
- [ ] Verify data sync works with production Supabase instance
- [ ] Test RLS policies with production data
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging

### Post-Deployment
- [ ] Monitor sync performance and error rates
- [ ] Set up alerts for authentication failures
- [ ] Test user registration and login flows
- [ ] Verify data integrity across devices

## Performance Optimization

### Database Indexes
```sql
-- Ensure these indexes exist for optimal performance
CREATE INDEX IF NOT EXISTS idx_app_usage_logs_user_id ON app_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_app_usage_logs_device_id ON app_usage_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_app_usage_logs_start_time ON app_usage_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_app_usage_logs_created_at ON app_usage_logs(created_at);
```

### Sync Optimization
- Consider implementing batch size limits for large datasets
- Add retry logic with exponential backoff
- Monitor sync frequency and adjust based on usage patterns

## Monitoring and Maintenance

### Key Metrics to Track
- Authentication success/failure rates
- Sync performance and error rates
- Database query performance
- User session duration and activity

### Regular Maintenance
- Review and update RLS policies as needed
- Monitor database size and performance
- Update Supabase client libraries
- Review security settings quarterly 