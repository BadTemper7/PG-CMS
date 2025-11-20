import { CloudinaryImage } from "@cloudinary/url-gen"
import { scale } from "@cloudinary/url-gen/actions/resize"

export const cldImageFromUrl = (url) => {
  try {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME

    const startIndex = url.indexOf("/upload/") + 8
    let publicId = url.substring(startIndex)

    // remove extension
    publicId = publicId.replace(/\.[^/.]+$/, "")

    return new CloudinaryImage(publicId, { cloudName }).resize(
      scale().width(500)
    )
  } catch (e) {
    console.error("Invalid Cloudinary URL:", url)
    return null
  }
}
