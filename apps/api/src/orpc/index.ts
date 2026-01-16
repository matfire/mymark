import { os } from "./implement";
import * as syncRouter from "./routers/sync";

export const router = os.router({
	sync: syncRouter,
});
