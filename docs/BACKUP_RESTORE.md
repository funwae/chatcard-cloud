# Backup & Restore Procedures

## Backup Strategy

### Database (PostgreSQL)

**Automated Backups:**
- Point-in-time recovery (PITR) enabled
- Daily full backups at 2 AM UTC
- Transaction logs retained for 7 days
- Backups stored in separate region

**Manual Backup:**
```bash
# Full database backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Schema only
pg_dump --schema-only $DATABASE_URL > schema-$(date +%Y%m%d).sql
```

### Redis

**Configuration:**
- AOF (Append-Only File) enabled
- fsync every second
- RDB snapshots every 5 minutes

**Manual Backup:**
```bash
# Trigger RDB snapshot
redis-cli -u $REDIS_URL BGSAVE

# Copy AOF file
cp /var/lib/redis/appendonly.aof backup-$(date +%Y%m%d).aof
```

## Restore Procedures

### Database Restore

**From Full Backup:**
```bash
# Drop and recreate database (CAUTION: destroys existing data)
dropdb chatcard
createdb chatcard

# Restore
psql $DATABASE_URL < backup-20250115.sql
```

**Point-in-Time Recovery:**
```bash
# Restore to specific timestamp
pg_restore --timestamp="2025-01-15 14:30:00" $DATABASE_URL backup.tar
```

**Verify Restore:**
```bash
# Check record counts
psql $DATABASE_URL -c "SELECT 'users' as table, COUNT(*) FROM \"User\" UNION ALL SELECT 'proofs', COUNT(*) FROM \"Proof\" UNION ALL SELECT 'anchors', COUNT(*) FROM \"Anchor\";"
```

### Redis Restore

**From RDB:**
```bash
# Stop Redis
redis-cli -u $REDIS_URL SHUTDOWN

# Replace RDB file
cp backup-20250115.rdb /var/lib/redis/dump.rdb

# Start Redis
systemctl start redis
```

**From AOF:**
```bash
# Stop Redis
redis-cli -u $REDIS_URL SHUTDOWN

# Replace AOF file
cp backup-20250115.aof /var/lib/redis/appendonly.aof

# Start Redis (will replay AOF)
systemctl start redis
```

## Testing Backups

**Nightly Restore Test:**
1. Create test database
2. Restore latest backup
3. Verify data integrity
4. Check record counts match production
5. Test critical queries
6. Document any issues

**Test Script:**
```bash
#!/bin/bash
# Run nightly restore test

TEST_DB="chatcard_test_$(date +%Y%m%d)"
LATEST_BACKUP=$(ls -t backup-*.sql | head -1)

# Create test database
createdb $TEST_DB

# Restore
psql $TEST_DB < $LATEST_BACKUP

# Verify
psql $TEST_DB -c "SELECT COUNT(*) FROM \"User\";"
psql $TEST_DB -c "SELECT COUNT(*) FROM \"Proof\";"

# Cleanup
dropdb $TEST_DB
```

## Retention Policy

- **Full backups:** 30 days
- **Transaction logs:** 7 days
- **Redis snapshots:** 7 days
- **AOF files:** 3 days

## Disaster Recovery

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 1 hour

**Recovery Steps:**
1. Assess damage and determine restore point
2. Provision new infrastructure if needed
3. Restore database from backup
4. Restore Redis from snapshot/AOF
5. Verify data integrity
6. Restart services
7. Monitor for issues

## Backup Monitoring

Set up alerts for:
- Backup failures
- Backup size anomalies
- Restore test failures
- Disk space for backup storage

