import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dhhwnmj6e",
  api_key: "588611752873226",
  api_secret: "Y3AnxhGfc0wh3iTIlXS0HnORBOc",
});

export async function uploadToCloudinary(
  fileBuffer,
  folder,
  resourceType = "auto"
) {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(fileBuffer);
  });
}
