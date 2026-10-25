// Confirmed against the backend design (sdd/user-authentication/design,
// garal-screener): httpOnly/Secure/SameSite=Lax cookie named `access_token`.
// Server code can only check whether it is present, never read its claims.
export const AUTH_COOKIE_NAME = 'access_token'
