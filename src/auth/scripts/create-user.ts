import { Container } from "../../routes/container/container";
import { AuthService } from "../services/auth-service";

async function createUser(username: string, password: string) {
  const container = Container.getInstance();
  const authService = container.get<AuthService>("authService");

  const user = await authService.createUser(username, password);

  if (user) {
    console.log(`User created successfully: ${user.username} (ID: ${user.id})`);
  } else {
    console.error("Failed to create user - username may already exist");
  }

  process.exit(0);
}

// Usage: bun run src/auth/scripts/create-user.ts <username> <password>
const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error(
    "Usage: bun run src/auth/scripts/create-user.ts <username> <password>",
  );
  process.exit(1);
}

createUser(username, password);
