import { Router } from "express";
export const uploadRouter = Router();
// Mock Cloud Storage — in prod: use @google-cloud/storage + Pub/Sub
// POST /api/upload — returns signed URL + stored URL
uploadRouter.post("/", async (req, res) => {
  const { filename, contentType } = req.body;
  if (!filename) return res.status(400).json({ error: "filename required" });
  // In prod: generate signed URL via storage.bucket().file().getSignedUrl({ action: "write", expires: Date.now()+15*60*1000, contentType })
  const mockUrl = `https://storage.googleapis.com/jansetu-demo-citizen-media/${Date.now()}-${filename}`;
  const signedUploadUrl = `${mockUrl}?mockSignedUrl=true`;
  res.json({ uploadUrl: signedUploadUrl, photoUrl: mockUrl, bucket: "jansetu-demo-citizen-media", note: "Mock — in prod uses Cloud Storage + Pub/Sub for async processing" });
});
uploadRouter.get("/health", (_req,res)=> res.json({ ok:true, service:"storage-mock" }));
