export async function GET(_request: Request) {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
