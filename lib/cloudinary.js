import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dwfqbpxfb",
  api_key: "564997124141877",
  api_secret: "A_1m_eF4Mqr90gBeRoUj4Ll4EsQ",
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
