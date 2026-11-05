-- App URL and cron secret for the hourly reminder job (scheduled by the
-- 20261105000000_reminders_cron migration, which does nothing until both are set).
--
-- Run once per environment in the Supabase SQL editor, after replacing the two
-- placeholders. Not a migration: the values differ per environment, and the secret
-- must match that environment's CRON_SECRET.

select vault.create_secret('https://YOUR-APP-URL', 'reminders_app_url');
select vault.create_secret('YOUR_CRON_SECRET', 'reminders_cron_secret');

-- To inspect:   select * from cron.job_run_details order by start_time desc limit 20;
--               select * from net._http_response order by created desc limit 20;
-- To rotate:    select vault.update_secret(id, 'NEW_SECRET') from vault.secrets where name = 'reminders_cron_secret';
-- To pause:     select cron.alter_job(jobid, active := false) from cron.job where jobname = 'send-reminders';
