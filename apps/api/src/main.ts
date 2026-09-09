import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/http-exception.filter";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  });

  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Restaurant Platform API")
    .setDescription("White-Label Multi-Tenant Restaurant Platform API")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
}

if (process.env.NODE_ENV !== "test") {
  bootstrap();
}
