import { createApp } from "./app";
import { APP_PORT } from "./config";

(async () => {
  const app = createApp();

  app.listen(APP_PORT, () => console.log(`http://localhost:${APP_PORT}`));
})();
