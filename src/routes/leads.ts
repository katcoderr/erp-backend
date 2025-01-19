import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, like } from 'drizzle-orm';
import { Hono } from 'hono';
import { leads } from '../db/schema';

export type Env = {
	DATABASE_URL: string;
};

export const leadsRouter = new Hono<{
	Bindings: Env;
}>();

function handleError(c: any, error: any, message: string) {
	console.error(message, error);
	return c.json({ error: message }, 500);
}

leadsRouter.get('/', async (c) => {
	const sql = neon(c.env.DATABASE_URL);
	const db = drizzle(sql);
	try {
		const page = parseInt(c.req.query('page') || '1', 10);
		const limit = parseInt(c.req.query('limit') || '20', 10);
		const source = c.req.query('source');
		const owner = c.req.query('owner');
		const query = c.req.query('query');

		if (isNaN(page) || isNaN(limit)) {
			return c.json({ error: 'Invalid page or limit parameter' }, 400);
		}

		const offset = (page - 1) * limit;

		const conditions = [];
		if (source) conditions.push(eq(leads.source, source));
		if (owner) conditions.push(eq(leads.owner, owner));
		if (query) conditions.push(like(leads.name, `%${query}%`));

		const results = await db
			.select()
			.from(leads)
			.where(and(...conditions))
			.offset(offset)
			.limit(limit);

		const totalCountResult = await db
			.select()
			.from(leads)
			.where(and(...conditions))
			.then((res) => res.length);

		const totalPages = Math.ceil(totalCountResult / limit);

		return c.json({
			leads: results,
			count: results.length,
			totalPages,
		});
	} catch (error) {
		return handleError(c, error, 'Error fetching leads');
	}
});

leadsRouter.post('/', async (c) => {
	const sql = neon(c.env.DATABASE_URL);
	const db = drizzle(sql);

	try {
		const body = await c.req.json();

		if (!body.name || !body.source || !body.owner) {
			return c.json({ error: 'Missing required fields (name, source, owner)' }, 400);
		}

		const newLead = await db
			.insert(leads)
			.values({
				name: body.name,
				source: body.source,
				owner: body.owner,
			})
			.returning();

		return c.json(newLead[0], 201);
	} catch (error) {
		return handleError(c, error, 'Error adding lead');
	}
});

leadsRouter.patch('/:id/stage', async (c) => {
	const sql = neon(c.env.DATABASE_URL);
	const db = drizzle(sql);
	try {
		const { id } = c.req.param();
		const { stage } = await c.req.json();

		if (!stage) {
			return c.json({ error: 'Stage is required' }, 400);
		}

		const updatedLead = await db
			.update(leads)
			.set({
				stage,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(leads.id, parseInt(id)))
			.returning();

		if (updatedLead.length === 0) {
			return c.json({ error: 'Lead not found' }, 404);
		}

		return c.json(updatedLead[0]);
	} catch (error) {
		return handleError(c, error, 'Error updating lead stage');
	}
});

leadsRouter.patch('/:id/owner', async (c) => {
	const sql = neon(c.env.DATABASE_URL);
	const db = drizzle(sql);
	try {
		const { id } = c.req.param();
		const { owner } = await c.req.json();

		if (!owner) {
			return c.json({ error: 'Owner is required' }, 400);
		}

		const updatedLead = await db
			.update(leads)
			.set({
				owner,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(leads.id, parseInt(id)))
			.returning();

		if (updatedLead.length === 0) {
			return c.json({ error: 'Lead not found' }, 404);
		}

		return c.json(updatedLead[0]);
	} catch (error) {
		return handleError(c, error, 'Error updating lead owner');
	}
});
