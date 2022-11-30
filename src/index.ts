import { Hono } from "hono";
import { Redis } from "@upstash/redis/cloudflare";
import z, { ZodError } from "zod";

const app = new Hono();

app.get("/currency/:currencyName", async (c) => {
    const redis = Redis.fromEnv(c.env);
    const currencyName = c.req.param("currencyName");
    const rateFromUSD = await redis.get(currencyName);

    return c.json({ rateFromUSD });
});

const addCurrencySchema = z.object({
    currencyName: z.string().min(1).max(3),
    rateFromUSD: z.number().positive(),
});

app.post("/currency", async (c) => {
    const redis = Redis.fromEnv(c.env);
    const body = await c.req.json();

    try {
        const currency = addCurrencySchema.parse(body);
        await redis.set(`${currency.currencyName}`, `${currency.rateFromUSD}`);
        return c.json({ message: "Currency added", currency }, 201);
    } catch {
        return c.json({ error: "Invalid currency" }, 400);
    }
});

const convertCurrencySchema = z.object({
    amount: z.number().positive("Amount must be positive"),
    from: z.string().min(1).max(3),
    to: z.string().min(1).max(3),
});

const cryptos = ["BTC", "ETH", "XRP", "LTC", "BCH", "BNB", "ADA", "DOGE"];

app.get("/convert", async (c) => {
    const redis = Redis.fromEnv(c.env);

    const from = c.req.query("from");
    const to = c.req.query("to");
    const amount = Number(c.req.query("amount"));

    try {
        const currency = convertCurrencySchema.parse({ amount, from, to });

        const fromMultiplier = await redis.get(currency.from);
        const toMultiplier = await redis.get(currency.to);

        if (!fromMultiplier || !toMultiplier) {
            return c.json({ error: "Invalid currency(ies)" }, 400);
        }

        const amountInUSD = amount / Number(fromMultiplier);

        if (cryptos.includes(currency.to)) {
            const result = amountInUSD * Number(toMultiplier);

            return c.json({ result }, 200);
        }

        const result = (amountInUSD * Number(toMultiplier)).toFixed(2);

        return c.json({ result }, 200);
    } catch (err) {
        if (err instanceof ZodError) {
            return c.json(
                {
                    errors: err.errors,
                },
                400
            );
        }
    }
});

export default app;
