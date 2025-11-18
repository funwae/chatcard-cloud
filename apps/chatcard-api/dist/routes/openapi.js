import { Router } from 'express';
import { generateOpenAPISpec } from '../openapi/spec.js';
export const openapiRouter = Router();
// GET /docs/openapi.json - OpenAPI 3.1 spec
openapiRouter.get('/openapi.json', (req, res) => {
    const spec = generateOpenAPISpec();
    res.set({
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    });
    res.json(spec);
});
// GET /docs - Swagger UI (development only)
if (process.env.NODE_ENV !== 'production') {
    openapiRouter.get('/', (req, res) => {
        const spec = generateOpenAPISpec();
        const specUrl = `${req.protocol}://${req.get('host')}/docs/openapi.json`;
        res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>ChatCard API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "${specUrl}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
    `);
    });
}
//# sourceMappingURL=openapi.js.map