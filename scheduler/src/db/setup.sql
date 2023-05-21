CREATE TABLE "public"."transaction_schedules" (
    id SERIAL PRIMARY KEY,
    tx VARCHAR(8192) UNIQUE,
    time INT
);
CREATE INDEX "idx_transaction_schedules_time" ON "public"."transaction_schedules" (time);