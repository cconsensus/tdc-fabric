class IdentityError extends Error {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly stack: string;
  public readonly txId: string;

  constructor(message: string, statusCode = 400, stack?: string, txId?: string) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    }
    if (txId) {
      this.txId = txId;
    }
  }
}

export default IdentityError;
