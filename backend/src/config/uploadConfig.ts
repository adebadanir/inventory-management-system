import multer from "multer";
import path from "path";

// Konfigurasi penyimpanan berdasarkan fieldname
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "avatar") {
      cb(null, "uploads/images/avatars/");
    } else if (file.fieldname === "productImage") {
      cb(null, "uploads/images/products/");
    } else {
      cb(new Error("Invalid fieldname"), "");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filter file (hanya menerima gambar)
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

// Middleware multer untuk avatar & produk
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
  fileFilter,
});

export default upload;
