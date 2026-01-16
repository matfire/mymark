import { oc } from "@orpc/contract";
import z from "zod";

const storeDocumentUrl = oc.input(z.object({ docUrl: z.string() }));

const getDocumentUrl = oc.output(
	z.object({ documentUrl: z.string().optional() }),
);

export { storeDocumentUrl, getDocumentUrl };
