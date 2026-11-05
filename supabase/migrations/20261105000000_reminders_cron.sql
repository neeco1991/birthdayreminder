-- Hourly trigger for the reminder job (GET /api/cron/reminders).
-- Vercel Hobby cron can only run daily, so the schedule lives in Postgres instead.
-- The app URL and cron secret differ per environment, so they live in Vault and are read on
-- every run (set them with supabase/setup/cron.sql). Until both exist the job calls nothing,
-- so environments without them (dev, usually) stay quiet.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Scheduling an existing job name updates it, so this also takes over a job made by hand.
select cron.schedule(
  'send-reminders',
  '0 * * * *',
  $$
  select net.http_get(
    url := app_url.decrypted_secret || '/api/cron/reminders',
    headers := jsonb_build_object('Authorization', 'Bearer ' || cron_secret.decrypted_secret),
    timeout_milliseconds := 60000
  )
  from vault.decrypted_secrets app_url, vault.decrypted_secrets cron_secret
  where app_url.name = 'reminders_app_url' and cron_secret.name = 'reminders_cron_secret';
  $$
);
