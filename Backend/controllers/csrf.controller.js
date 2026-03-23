// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: src/controllers/csrf.controller.js  (NEW FILE — create this)
// ─────────────────────────────────────────────────────────────────────────────
//
// This controller exposes a single GET endpoint that hands the CSRF token
// (already set on req by csurf / csrf-csrf middleware) back to the frontend.
//
// Usage in your router:
//   const { getCsrfToken } = require('./controllers/csrf.controller');
//   router.get('/csrf-token', getCsrfToken);
//
// ─────────────────────────────────────────────────────────────────────────────

const getCsrfToken = (req, res) => {
    // csurf sets req.csrfToken()
    // csrf-csrf sets res.locals.csrfToken  OR  req.csrfToken()
    // Support both libraries:
    const token =
        (typeof req.csrfToken === 'function' ? req.csrfToken() : null) ||
        res.locals.csrfToken ||
        null;

    if (!token) {
        return res.status(500).json({
            statusCode: 500,
            message: 'CSRF middleware is not configured. Ensure csurf or csrf-csrf is mounted before this route.',
        });
    }

    return res.status(200).json({ csrfToken: token });
};

module.exports = { getCsrfToken };


// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: Additions to your existing router file (e.g. routes/admin.routes.js)
// ─────────────────────────────────────────────────────────────────────────────
//
// Add these lines to your router — the csrf-token route MUST be:
//   1. After the CSRF middleware is mounted (so req.csrfToken exists)
//   2. Before the auth middleware (the frontend calls it before login)
//   3. Listed as a GET so the request interceptor does NOT attach a CSRF header
//      (that would create a chicken-and-egg deadlock)
//
// Example additions (paste into your routes file):
//
//   const { getCsrfToken } = require('../controllers/csrf.controller');
//
//   // Public — no auth required, must come before protected routes
//   router.get('/csrf-token', getCsrfToken);
//   router.post('/admin/seed',  seedAdmin);
//   router.post('/admin/login', login);
//
// ─────────────────────────────────────────────────────────────────────────────