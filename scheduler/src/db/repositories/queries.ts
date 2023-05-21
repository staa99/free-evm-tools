export const queries = {
  getTransactionsByTime:
    'SELECT ts.id, ts.tx, ts.time FROM "public"."transaction_schedules" ts WHERE ts.time >= $1 and ts.time <= $2 ORDER BY ts.time',
  insertTransaction: 'INSERT INTO "public"."transaction_schedules" (tx, time) VALUES ($1, $2)',
  deleteTransaction: 'DELETE FROM "public"."transaction_schedules" ts WHERE ts.id = $1',
}
