import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

export async function createNestApp() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const origins = (config.get<string>('FRONTEND_ORIGINS') ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: origins,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  await app.init()
  return app
}

async function bootstrap() {
  const app = await createNestApp()
  const config = app.get(ConfigService)
  await app.listen(config.get<number>('PORT') ?? 3000)
}

if (require.main === module) void bootstrap()
