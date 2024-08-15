import { v2 as cloudinary} from "cloudinary"
import fs from "fs" //file system

      
cloudinary.config({ 
  cloud_name: 'dimahkbnh', 
  api_key: '169688681512636', 
  api_secret:  '7oU-2vtNkuauXhGCyvbCNZxzh9E'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        const response = await cloudinary.uploader.upload(localFilePath, {  resource_type: 'auto'});

        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
        return response;
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
        return error;
    }
};

  export {uploadOnCloudinary}