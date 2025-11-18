import { Router } from 'express';
import { passkeyRouter } from './auth-passkey.js';
import { magicRouter } from './auth-magic.js';
export const authRouter = Router();
// Passkey routes
authRouter.use('/passkey', passkeyRouter);
// Magic link routes
authRouter.use('/magic', magicRouter);
// Logout
authRouter.post('/logout', async (req, res) => {
    req.session?.destroy(() => {
        res.json({ success: true });
    });
});
//# sourceMappingURL=auth.js.map