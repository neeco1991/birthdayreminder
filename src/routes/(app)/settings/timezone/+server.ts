import { error } from '@sveltejs/kit';
import { isValidTimeZone } from '#lib/dates.ts';
import type { RequestHandler } from './$types';

/** Records the browser's timezone, only if the user hasn't got one yet. */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const body = await request.json().catch(() => null);
	const timezone = body?.timezone;
	if (typeof timezone !== 'string' || !isValidTimeZone(timezone)) error(400, 'Invalid timezone');

	const { error: dbError } = await locals.supabase
		.from('profiles')
		.update({ timezone })
		.eq('id', locals.user.id)
		.is('timezone', null);
	if (dbError) error(500, 'Could not save timezone');

	return new Response(null, { status: 204 });
};
