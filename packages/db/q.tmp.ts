import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
const db = new PGlite(process.argv[2]!, { extensions: { btree_gist } });
console.log(
  (
    await db.query(
      `select u.name, t.city, t.price_30_cents, t.price_60_cents from trainer_profile t join "user" u on u.id=t.user_id order by u.name`,
    )
  ).rows,
);
console.log(
  (
    await db.query(
      `select pet_name, price_cents, status from booking order by starts_at desc limit 4`,
    )
  ).rows,
);
