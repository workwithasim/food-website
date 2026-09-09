import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Application E2E", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("handles standard /api/v1 prefix routing", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/health")
      .expect(200);

    expect(response.body).toHaveProperty("data");
    expect(response.body.data.status).toBe("ok");
  });

  it("returns 404 for unknown endpoints", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/unknown-endpoint")
      .expect(404);
  });
});
