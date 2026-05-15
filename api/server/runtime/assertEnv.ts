export class MissingEnvError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(`Missing required environment variables: ${missing.join(', ')}`);
    this.name = 'MissingEnvError';
    this.missing = missing;
  }
}

export function getMissingEnv(required: string[]): string[] {
  return required.filter((name) => {
    const value = process.env[name];
    return !value || value.trim().length === 0;
  });
}

export function assertEnv(required: string[]): void {
  const missing = getMissingEnv(required);
  if (missing.length > 0) {
    throw new MissingEnvError(missing);
  }
}
