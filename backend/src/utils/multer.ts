import multer from 'multer';

export const multerUpload = multer({
	limits: {
		fileSize: 3 * 1024 * 1024,
	},
});
