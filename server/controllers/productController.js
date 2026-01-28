import { v2 as cloudinary } from 'cloudinary';


// Add product :/api/product/add
export const addProduct = async (req, res) => {
    try {
        const images = req.files;

        let imageUrls = await Promise.all(images.map(async (item) => {
            const result = await cloudinary.uploader.upload(item.path, {
                resource_type: "image",
            });
            return result.secure_url;
        }));

        // Send response with image URLs
        res.json({
            success: true,
            message: "Product added successfully",
            imageUrl: imageUrls[0]
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }

}
