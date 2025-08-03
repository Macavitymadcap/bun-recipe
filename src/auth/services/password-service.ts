export class PasswordService {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: this.saltRounds,
    });
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
  }
}
