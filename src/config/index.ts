import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL!,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 10,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_access_expiration: process.env.JWT_ACCESS_EXPIRATION || "2d",
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_refresh_expiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
  stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  app_url: process.env.APP_URL!,
};
