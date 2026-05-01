package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.*;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.mapper.HobbyMapper;
import io.github.csci499_group8.local_hobbies.backend.model.Hobby;
import io.github.csci499_group8.local_hobbies.backend.model.HobbyPhoto;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import io.github.csci499_group8.local_hobbies.backend.repository.GlobalHobbyRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.HobbyPhotoRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.HobbyRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.projections.HobbyPhotoProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HobbyService {

    private final HobbyRepository hobbyRepository;
    private final HobbyPhotoRepository hobbyPhotoRepository;
    private final GlobalHobbyRepository globalHobbyRepository;
    private final HobbyMapper hobbyMapper;
    private final StorageService storageService;

    // --- methods called by HobbyController ---

    @Transactional(readOnly = true)
    public List<HobbyResponse> getHobbies(UUID userId) {
        return getHobbiesByUserId(userId);
    }

    @Transactional
    public HobbyResponse addHobby(UUID userId, HobbyCreationRequest request) {
        if (hobbyRepository.existsByUserIdAndName(userId, request.name())) {
            throw new IllegalStateException("Hobby already exists");
        }

        Hobby hobby = hobbyMapper.toEntity(request, userId);
        return hobbyMapper.toResponse(hobbyRepository.save(hobby));
    }

    @Transactional
    public HobbyResponse updateHobby(UUID userId, UUID hobbyId,
                                     HobbyUpdateRequest request) {
        Hobby hobby = findHobbyByUserIdAndId(userId, hobbyId);

        hobbyMapper.updateEntity(request, hobby);
        return hobbyMapper.toResponse(hobbyRepository.save(hobby));
    }

    /**
     * Delete hobby and associated hobby photos
     */
    @Transactional
    public void deleteHobby(UUID userId, UUID hobbyId) {
        Hobby hobby = findHobbyByUserIdAndId(userId, hobbyId);

        List<String> hobbyPhotoKeys = hobbyPhotoRepository.findAllByHobbyId(hobbyId).stream()
                                                          .map(projection -> projection.getHobbyPhoto().getPhotoKey())
                                                          .toList();

        hobbyRepository.delete(hobby);

        try {
            storageService.deleteObjects(hobbyPhotoKeys);
        } catch (Exception e) {
            log.error("Failed to delete hobby photos with hobby ID: {}", hobbyId, e);
        }
    }

    @Transactional(readOnly = true)
    public List<GlobalHobbyResponse> getGlobalHobbies() {
        return globalHobbyRepository.findAll().stream()
                                    .map(hobbyMapper::toGlobalResponse)
                                    .toList();
    }

    @Transactional(readOnly = true)
    public UploadUrlResponse generatePresignedUploadUrl(UUID userId, UUID hobbyId,
                                                        UploadUrlRequest request) {
        findHobbyByUserIdAndId(userId, hobbyId);

        //key = file path/ID
        String objectKey = "users/" + userId + "/hobbies/" + hobbyId + "/"
                + System.currentTimeMillis() + "_" + request.fileName();

        //get temporary PUT URL from storage provider
        PresignedUrlData urlData = storageService.createPresignedPutUrl(objectKey, request.contentType());

        return new UploadUrlResponse(objectKey, urlData.url(), urlData.expirationTime());
    }

    @Transactional(readOnly = true)
    public List<HobbyPhotoResponse> getHobbyPhotos(UUID userId) {
        return getHobbyPhotosByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<HobbyPhotoResponse> getHobbyPhotosByHobbyId(UUID hobbyId) {
        return mapBatchPhotosToPhotoResponses(hobbyPhotoRepository.findAllByHobbyId(hobbyId));
    }

    @Transactional
    public HobbyPhotoResponse addHobbyPhoto(UUID userId, UUID hobbyId,
                                            HobbyPhotoCreationRequest request) {
        //check that hobby exists and extract hobby name
        HobbyName hobbyName = findHobbyByUserIdAndId(userId, hobbyId).getName();

        HobbyPhoto photo = hobbyMapper.toPhotoEntity(request, hobbyId);
        photo = hobbyPhotoRepository.save(photo);

        return hobbyMapper.toPhotoResponse(photo, hobbyName, getPhotoUrl(photo.getPhotoKey()));
    }

    @Transactional
    public HobbyPhotoResponse updateHobbyPhoto(UUID userId, UUID photoId,
                                               HobbyPhotoUpdateRequest request) {
        HobbyPhoto photo = findHobbyPhotoByUserIdAndId(userId, photoId);
        HobbyName hobbyName = findHobbyByUserIdAndId(userId, photo.getHobbyId()).getName();

        hobbyMapper.updatePhotoEntity(request, photo);
        photo = hobbyPhotoRepository.save(photo);

        return hobbyMapper.toPhotoResponse(photo, hobbyName, getPhotoUrl(photo.getPhotoKey()));
    }

    @Transactional
    public void deleteHobbyPhoto(UUID userId, UUID photoId) {
        String photoKey = findHobbyPhotoByUserIdAndId(userId, photoId).getPhotoKey();

        hobbyPhotoRepository.deleteById(photoId);

        try {
            storageService.deleteObjects(List.of(photoKey));
        } catch (Exception e) { //log and rethrow
            log.error("Failed to delete hobby photo with key: {}", photoKey, e);
            throw e;
        }
    }

    // --- methods called by services ---

    //returns empty list if user not found
    @Transactional(readOnly = true)
    public List<HobbyResponse> getHobbiesByUserId(UUID userId) {
        return hobbyRepository.findAllByUserId(userId).stream()
                              .map(hobbyMapper::toResponse)
                              .toList();
    }

    //returns 0 if user not found
    @Transactional(readOnly = true)
    public Integer getHobbyCount(UUID userId) {
        return hobbyRepository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<HobbyOverlapResponse> getOverlappingHobbies(UUID currentUserId,
                                                            UUID otherUserId) {
        //other user's existence has been validated by userService caller

        return hobbyRepository.findOverlappingHobbies(currentUserId, otherUserId);
    }

    @Transactional
    public void addOnboardingHobbies(UUID userId, List<HobbyCreationRequest> requests) {
        //verify that hobbies are unique
        Set<HobbyName> uniqueHobbies = requests.stream()
                                               .map(HobbyCreationRequest::name)
                                               .collect(Collectors.toSet());
        if (uniqueHobbies.size() < requests.size()) {
            throw new IllegalArgumentException("Onboarding hobby list contains duplicate hobbies");
        }

        //save hobbies
        List<Hobby> hobbies = requests.stream()
                                      .map(req -> hobbyMapper.toEntity(req, userId))
                                      .toList();
        hobbyRepository.saveAll(hobbies);
    }

    //returns empty list if user not found
    @Transactional(readOnly = true)
    public List<HobbyPhotoResponse> getHobbyPhotosByUserId(UUID userId) {
        return mapBatchPhotosToPhotoResponses(hobbyPhotoRepository.findAllByUserId(userId));
    }

    // --- private helper methods ---

    /**
     * Verify that hobby exists and that request is authorized. Log unauthorized
     * requests.
     * @throws ResourceNotFoundException if hobby does not exist or request is unauthorized
     */
    protected Hobby findHobbyByUserIdAndId(UUID userId, UUID hobbyId) {
        Hobby hobby = hobbyRepository.findById(hobbyId).orElseThrow(
                () -> new ResourceNotFoundException("Hobby not found with ID: " + hobbyId)
        );

        //verify ownership
        if (!hobby.getUserId().equals(userId)) {
            log.warn("Unauthorized access attempt: User {} tried to access hobby {} owned by user {}",
                     userId, hobbyId, hobby.getUserId());

            throw new ResourceNotFoundException("Hobby not found with ID: " + hobbyId);
        }
        return hobby;
    }

    /**
     * Verify that hobby photo exists and that request is authorized. Log
     * unauthorized requests.
     * @throws ResourceNotFoundException if hobby photo does not exist or request
     *         is unauthorized
     */
    protected HobbyPhoto findHobbyPhotoByUserIdAndId(UUID userId, UUID photoId) {
        HobbyPhoto photo = hobbyPhotoRepository.findById(photoId).orElseThrow(
                () -> new ResourceNotFoundException("Hobby photo not found with ID: " + photoId)
        );

        //verify ownership and log forbidden requests
        findHobbyByUserIdAndId(userId, photo.getHobbyId());

        return photo;
    }

    private String getPhotoUrl(String objectKey) {
        if (objectKey == null) return null;

        return storageService.createPresignedGetUrl(objectKey);
    }

    private List<HobbyPhotoResponse> mapBatchPhotosToPhotoResponses(List<HobbyPhotoProjection> photoProjections) {
        List<String> keys = photoProjections.stream()
                                            .map(projection -> projection.getHobbyPhoto().getPhotoKey())
                                            .toList();

        Map<String, String> keyToUrl = (!keys.isEmpty())
                ? storageService.createBatchPresignedGetUrls(keys)
                : Collections.emptyMap();

        return photoProjections.stream()
                               .map(projection -> hobbyMapper.toPhotoResponse(
                                       projection,
                                       keyToUrl.get(projection.getHobbyPhoto().getPhotoKey())
                               )).toList();
    }

}
