/**
 * GeoJSON geometry type ("Point" for point location)
 */
export enum GeometryType {
    Point = 'Point',
}

/**
 * Standard GeoJSON Point representation
 */
export interface GeoJsonPoint {
    geometryType: GeometryType;
    /** Coordinates in [longitude, latitude] format */
    coordinates: [number, number];
}

/**
 * Request for a presigned URL to upload a file to cloud storage
 */
export interface UploadUrlRequest {
    fileName: string;
    contentType: string;
}

/**
 * Response containing the presigned URL and metadata for cloud storage upload
 */
export interface UploadUrlResponse {
    /** Unique key/path assigned to the file in storage */
    fileKey: string;
    /** Temporary authenticated URL for the binary upload */
    uploadUrl: string;
    /** ISO 8601 UTC timestamp of when the upload URL expires */
    expirationTime: string;
}

/**
 * Standardized error response body returned by the backend
 */
export interface GlobalError {
    /** Machine-readable error identifier */
    errorCode: string;
    /** Human-readable explanation of the error */
    errorMessage: string;
    /** ISO 8601 UTC timestamp of the error occurrence */
    timestamp: string;
    /** API endpoint that triggered the error */
    endpointURI: string;
}