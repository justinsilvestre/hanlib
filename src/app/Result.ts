export type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: any;
      message: string;
    };

export const success = <T>(value: T): Result<T> => ({
  ok: true,
  value,
});

export const failure = (error: any): Result<never> => ({
  ok: false,
  error,
  get message() {
    return error instanceof Error ? error.message : String(error);
  },
});

export const attempt = <T>(fn: () => T): Result<T> => {
  try {
    return success(fn());
  } catch (error) {
    return failure(error);
  }
};
