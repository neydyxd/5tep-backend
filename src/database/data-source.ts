import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Session } from '../auth/session.entity';
import { Profile } from '../users/profile.entity';
import { User } from '../users/user.entity';

/** Data source for the migration CLI; the application is configured in AppModule. */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'fivestep',
  password: process.env.DB_PASSWORD ?? 'fivestep',
  database: process.env.DB_NAME ?? 'fivestep',
  entities: [User, Profile, Session],
  // Works both from sources and from the compiled bundle inside the container.
  migrations: [`${__dirname}/migrations/*.{ts,js}`],
  synchronize: false,
});
