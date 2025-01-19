import { Hono } from 'hono'
import { leadsRouter } from './routes/leads'

export type Env = {
	DATABASE_URL : string
}

const app = new Hono<{
	Bindings : Env
}>()

app.route("/leads", leadsRouter)

export default app