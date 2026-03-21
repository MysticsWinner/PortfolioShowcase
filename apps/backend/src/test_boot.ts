import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    await app.listen(3002);
    console.log("SERVER BOOTED SUCCESSFULLY ON 3002");
    process.exit(0);
  } catch(err) {
    console.error("BOOT CRASH:", err);
    process.exit(1);
  }
}
bootstrap();
