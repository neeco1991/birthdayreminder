-- Hourly trigger for the reminder job (GET /api/cron/reminders).
--
-- Run once per environment in the Supabase SQL editor, after replacing the two
-- placeholders. Not a migration: the URL and secret differ per environment.
-- Vercel Hobby cron can only run daily, so the schedule lives in Postgres instead.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select vault.create_secret('https://YOUR-APP.vercel.app', 'reminders_app_url');
select vault.create_secret('YOUR_CRON_SECRET', 'reminders_cron_secret');

select cron.schedule(
  'send-reminders',
  '0 * * * *',
  $$
  select net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'reminders_app_url')
      || '/api/cron/reminders',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'reminders_cron_secret')
    ),
    timeout_milliseconds := 60000
  );
  $$
);

-- To inspect:   select * from cron.job_run_details order by start_time desc limit 20;
--               select * from net._http_response order by created desc limit 20;
-- To rotate:    select vault.update_secret(id, 'NEW_SECRET') from vault.secrets where name = 'reminders_cron_secret';
-- To remove:    select cron.unschedule('send-reminders');
