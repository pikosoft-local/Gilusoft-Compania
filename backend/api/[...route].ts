import serverlessExpress from '@codegenie/serverless-express'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createNestApp } from '../src/main'

type ExpressHandler = ReturnType<typeof serverlessExpress>

let handlerPromise: Promise<ExpressHandler> | undefined

async function createHandler(): Promise<ExpressHandler> {
  const app = await createNestApp()
  return serverlessExpress({ app: app.getHttpAdapter().getInstance() })
}

export default async function vercelHandler(
  request: VercelRequest,
  response: VercelResponse,
) {
  handlerPromise ??= createHandler()
  const handler = await handlerPromise
  return handler(request, response)
}
