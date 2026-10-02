/**
 * Successful responses share one shape so the client only ever unwraps `data`:
 * { success: true, data: ... }
 */
export function sendSuccess(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}