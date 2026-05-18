import axios from 'axios';
import {UploadUrlResponse} from "@/src/types/common";

export const performTwoStepUpload = async (
    fileUri: string, //device's file's URI, provided by ImagePicker
    fileName: string, //file name, provided by ImagePicker
    fileType: string, //file type, provided by ImagePicker
    requestPresignedUrl: (name: string, type: string) => Promise<UploadUrlResponse> //user-service.ts- or hobby-service.ts-specific request
) => {
    //get the file key (path) and upload URL from backend
    const { fileKey, uploadUrl } = await requestPresignedUrl(fileName, fileType);

    //get the photo from the user's device
    const response = await fetch(fileUri); //get the photo metadata
    const blob = await response.blob(); //extract the photo as binary

    //send the binary photo data to the upload URL
    await axios.put(uploadUrl, blob, {
        headers: { 'Content-Type': fileType },
    });

    //return the fileKey so the UI can put it in the create/update request and send it to the backend
    return fileKey;
};
