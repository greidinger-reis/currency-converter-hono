# Currency converter (backend challenge)

## Description

This is a simple currency converter written in typescript, that runs on cloudflare workers runtime, using the hono.js framework.

The conversion rates and currency codes are stored in a Upstash Redis database, which is a key-value store, that is best suited for this use case. (Assuming that the upstash redis database was setup in the global locale option)

Once published this api/worker can be accessed in any location of the globe with relatively low latency.

## Technologies

- [Cloudflare Workers (wrangler)](https://developers.cloudflare.com/workers/)
- [Hono.js](https://honojs.dev/)
- [Upstash Redis](https://upstash.com/)
- [Zod](https://zod.dev/)

## How to run

1. Run `npm install` to install dependencies
2. Rename `wrangler.example.toml` to `wrangler.toml` and fill in the upstash redis rest api url and token
3. Run `npm run dev` to start the development server

## Publish to cloudflare

1. [Setup wrangler CLI with your cloudflare account](https://developers.cloudflare.com/workers/wrangler/get-started/)
2. Run `wrangler publish`

## Usage

### Convert

```bash
curl -X GET "PUBLISHED_URL/convert?from=CURRENCY_CODE&to=CURRENCY_CODE&amount=AMOUNT"
```

### Add new currency

```bash
curl -X POST "PUBLISHED_URL/currency" -H "Content-Type: application/json" -d '{"code": "CURRENCY_CODE", "rateFromUSD": RATE}'
```

