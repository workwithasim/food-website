import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Health API (Integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/health returns ok status and verifies Docker dependencies", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/health")
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.status).toBe("ok");
    expect(response.body.data.services.database).toBe("connected");
    expect(response.body.data.services.redis).toBe("connected");
  });
});
