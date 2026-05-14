export default function handler(_req: any, res: any) {
  res.setHeader('x-api-probe', 'true');
  res.status(200).json({ ok: true, probe: 'api-route' });
}
