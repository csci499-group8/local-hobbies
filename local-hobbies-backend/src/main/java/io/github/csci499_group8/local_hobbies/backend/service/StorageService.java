package io.github.csci499_group8.local_hobbies.backend.service;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StorageService {

    //TODO: implement storage services
    public PresignedUrlData createPresignedPutUrl(String objectKey, @NotBlank String s) {
        return null;
    }

    public void deleteObject(String url) {}

}
