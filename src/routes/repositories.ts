import { Router } from "express";
// import { logIn, logOut } from "../auth";
import { catchAsyncRequest } from "../middleware";
// import { validate, loginSchema } from "../validation";

const router = Router();

router.post(
  "/v1/google/repositories",
  catchAsyncRequest(async (req, res) => {
    res.json({});
  })
);

router.put(
  "/v1/google/repositories/to_file",
  catchAsyncRequest(async (req, res) => {
    res.json({});
  })
);

export default router;
