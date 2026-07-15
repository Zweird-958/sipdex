export class ApiClientError extends Error {
  public status: number
  public key: string

  constructor(message: string, status: number, key: string) {
    super(message)

    this.status = status
    this.key = key
  }
}
