import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1756900000000 implements MigrationInterface {
  name = 'InitialSchema1756900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "login" varchar(32) NOT NULL,
        "password_hash" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    // Login case is preserved, but a login is taken regardless of case.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "users_login_lower_uq" ON "users" (lower("login"))`,
    );

    await queryRunner.query(`
      CREATE TABLE "profiles" (
        "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
        "goal_steps" int NOT NULL DEFAULT 10000,
        "height_cm" int NOT NULL DEFAULT 170,
        "weight_kg" int NOT NULL DEFAULT 70,
        "preferred_time" varchar(16) NOT NULL DEFAULT 'evening',
        "streak_days" int NOT NULL DEFAULT 0,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "profiles_goal_steps_ck"
          CHECK ("goal_steps" BETWEEN 3000 AND 30000 AND "goal_steps" % 1000 = 0),
        CONSTRAINT "profiles_height_cm_ck" CHECK ("height_cm" BETWEEN 100 AND 230),
        CONSTRAINT "profiles_weight_kg_ck" CHECK ("weight_kg" BETWEEN 30 AND 250),
        CONSTRAINT "profiles_streak_days_ck" CHECK ("streak_days" >= 0),
        CONSTRAINT "profiles_preferred_time_ck"
          CHECK ("preferred_time" IN ('morning', 'midday', 'evening', 'late-evening'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_hash" char(64) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "last_seen_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "sessions_token_hash_uq" ON "sessions" ("token_hash")`,
    );
    await queryRunner.query(
      `CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
