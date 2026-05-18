package io.github.csci499_group8.local_hobbies.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    @Value("${application.supabase-s3.bucket}")
    private String bucket;

    @Value("${application.supabase-s3.put-duration}")
    private Duration putDuration;

    @Value("${application.supabase-s3.get-duration}")
    private Duration getDuration;

    /**
     * Generate a URL for the frontend to upload a file directly to Supabase
     */
    public PresignedUrlData createPresignedPutUrl(String objectKey, String contentType) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                                                            .bucket(bucket)
                                                            .key(objectKey)
                                                            .contentType(contentType)
                                                            .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                                                                        .signatureDuration(putDuration)
                                                                        .putObjectRequest(putObjectRequest)
                                                                        .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        return new PresignedUrlData(presignedRequest.url().toString(), presignedRequest.expiration().atOffset(ZoneOffset.UTC));
    }

    /**
     * Generate a URL for the frontend to fetch a file from Supabase
     */
    public String createPresignedGetUrl(String objectKey) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                                                                .bucket(bucket)
                                                                .key(objectKey)
                                                                .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                                                                            .signatureDuration(getDuration)
                                                                            .getObjectRequest(getObjectRequest)
                                                                            .build();

            return s3Presigner.presignGetObject(presignRequest).url().toString();
        } catch (Exception e) { //if get fails, return null so that placeholder URL can be returned
            log.error("Failed to generate presigned URL for key: {}", objectKey, e);
            return null;
        }
    }

    public Map<String, String> createBatchPresignedGetUrls(List<String> objectKeys) {
        if (objectKeys == null || objectKeys.isEmpty()) {
            return Collections.emptyMap();
        }

        return objectKeys.stream()
                         .filter(Objects::nonNull)
                         .distinct() //just in case, since database doesn't forbid duplicate keys
                         .collect(Collectors.toMap(
                                 key -> key,
                                 this::createPresignedGetUrl
                         ));
    }

    /**
     * Delete objects in Supabase. May throw. Let caller decide what to do with
     * thrown exceptions.
     */
    public void deleteObjects(List<String> objectKeys) {
        if (objectKeys == null || objectKeys.isEmpty()) return;

        List<ObjectIdentifier> identifiers = objectKeys.stream()
                                                       .map(key -> ObjectIdentifier.builder().key(key).build())
                                                       .toList();

        DeleteObjectsRequest deleteRequest = DeleteObjectsRequest.builder()
                                                                 .bucket(bucket)
                                                                 .delete(d -> d.objects(identifiers))
                                                                 .build();

        s3Client.deleteObjects(deleteRequest);
    }

}
