# Grafana Dashboard Setup

## Import Dashboard

1. Open Grafana and navigate to Dashboards → Import
2. Upload `grafana-dashboard.json` or paste its contents
3. Select your Prometheus data source
4. Adjust panel queries if your metric names differ

## Required Metrics

The dashboard expects these Prometheus metrics (exposed via `/metrics`):

- `http_requests_total{method, route, status}` - HTTP request counter
- `http_request_duration_seconds_bucket` - Request latency histogram
- `anchor_jobs_total{state}` - Anchor job counts by state
- `magiclink_requests_total` - Magic link request counter
- `magiclink_used_total` - Magic link usage counter
- `magiclink_expired_total` - Expired magic link counter
- `cosign_requests_total` - Co-signature counter
- `proofs_total` - Total proof counter
- `redis_up` - Redis connection status (1 = up, 0 = down)
- `postgres_up` - Postgres connection status (1 = up, 0 = down)

## Alert Configuration

Configure alert notifications in Grafana:

1. Go to Alerting → Notification channels
2. Add Slack/Email/PagerDuty channel
3. Update alert conditions in dashboard panels as needed

## Prometheus Scraping

Ensure Prometheus is scraping `/metrics` endpoint:

```yaml
scrape_configs:
  - job_name: 'chatcard-api'
    scrape_interval: 15s
    static_configs:
      - targets: ['api.chatcard.cloud:3001']
```

