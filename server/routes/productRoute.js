import express from "express";
import { addProduct} from "../controllers/productController.js";
import { upload } from "../configs/multer.js";


const productRouter = express.Router();

productRouter.post('/add', upload.array(["images"]), addProduct);

export default productRouter;