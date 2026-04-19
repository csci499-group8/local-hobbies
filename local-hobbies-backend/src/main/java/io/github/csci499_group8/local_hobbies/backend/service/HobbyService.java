package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.*;
import io.github.csci499_group8.local_hobbies.backend.dto.user.UserOnboardingRequest;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.mapper.HobbyMapper;
import io.github.csci499_group8.local_hobbies.backend.model.Hobby;
import io.github.csci499_group8.local_hobbies.backend.model.HobbyPhoto;
import io.github.csci499_group8.local_hobbies.backend.repository.GlobalHobbyRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.HobbyPhotoRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.HobbyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HobbyService {

    private final HobbyRepository hobbyRepository;
    private final HobbyPhotoRepository hobbyPhotoRepository;
    private final GlobalHobbyRepository globalHobbyRepository;
    private final HobbyMapper hobbyMapper;
    private final UserService userService;
    private final StorageService storageService;

    // --- methods called by HobbyController ---

    @Transactional(readOnly = true)
    public List<HobbyResponse> getCurrentUserHobbies(Integer userId) {
        return getHobbiesByUserId(userId);
    }

    @Transactional
    public HobbyResponse addHobby(Integer userId, HobbyCreationRequest request) {
        if (hobbyRepository.existsByUserAndName(userId, request.name())) {
            throw new IllegalStateException("Hobby already exists");
        }

        Hobby hobby = hobbyMapper.toEntity(request, userId);
        return hobbyMapper.toResponse(hobbyRepository.save(hobby));
    }

    @Transactional
    public HobbyResponse updateHobby(Integer userId, Integer hobbyId,
                                     HobbyUpdateRequest request) {
        Hobby hobby = findHobbyByUserAndId(userId, hobbyId);

        hobbyMapper.updateEntity(request, hobby);
        return hobbyMapper.toResponse(hobbyRepository.save(hobby));
    }

    @Transactional
    public void deleteHobby(Integer userId, Integer hobbyId) {
        Hobby hobby = findHobbyByUserAndId(userId, hobbyId);

        hobbyRepository.delete(hobby);
    }

    @Transactional(readOnly = true)
    public List<GlobalHobbyResponse> getGlobalHobbies() {
        return globalHobbyRepository.getAll().stream()
                                    .map(hobbyMapper::toGlobalResponse)
                                    .toList();
    }

    @Transactional(readOnly = true)
    public UploadUrlResponse generatePresignedUploadUrl(Integer userId, Integer hobbyId,
                                                        UploadUrlRequest request) {
        findHobbyByUserAndId(userId, hobbyId);

        //key = file path/ID
        String objectKey = "users/" + userId + "/hobbies/" + hobbyId + "/"
                + System.currentTimeMillis() + "_" + request.fileName();

        //get temporary PUT URL from storage provider
        PresignedUrlData urlData = storageService.createPresignedPutUrl(objectKey, request.contentType());

        return new UploadUrlResponse(objectKey, urlData.url(), urlData.expirationTime());
    }

    @Transactional(readOnly = true)
    public List<HobbyPhotoResponse> getCurrentUserHobbyPhotos(Integer userId) {
        return getHobbyPhotosByUserId(userId);
    }

    @Transactional
    public HobbyPhotoResponse addHobbyPhoto(Integer userId, Integer hobbyId,
                                            HobbyPhotoCreationRequest request) {
        findHobbyByUserAndId(userId, hobbyId);

        HobbyPhoto photo = hobbyMapper.toPhotoEntity(request, hobbyId);
        return hobbyMapper.toPhotoResponse(hobbyPhotoRepository.save(photo));
    }

    @Transactional
    public HobbyPhotoResponse updateHobbyPhoto(Integer userId, Integer photoId,
                                               HobbyPhotoUpdateRequest request) {
        HobbyPhoto photo = findHobbyPhotoByUserAndId(userId, photoId);

        hobbyMapper.updatePhotoEntity(request, photo);
        return hobbyMapper.toPhotoResponse(hobbyPhotoRepository.save(photo));
    }

    @Transactional
    public void deleteHobbyPhoto(Integer userId, Integer photoId) {
        HobbyPhoto photo = findHobbyPhotoByUserAndId(userId, photoId);

        storageService.deleteObject(photo.getUrl());
        hobbyPhotoRepository.delete(photo);
    }

    // --- methods called by services ---

    //returns empty list if user not found
    @Transactional(readOnly = true)
    public List<HobbyResponse> getHobbiesByUserId(Integer userId) {
        return hobbyRepository.findAllByUserId(userId).stream()
                              .map(hobbyMapper::toResponse)
                              .toList();
    }

    //returns 0 if user not found
    @Transactional(readOnly = true)
    public Integer getHobbyCount(Integer userId) {
        return hobbyRepository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<HobbyOverlapResponse> getOverlappingHobbies(Integer currentUserId,
                                                            Integer otherUserId) {
        userService.findOtherUserOrThrow(otherUserId);

        //TODO: Custom SQL to find hobbies with the same name between two userIds
        return hobbyRepository.findOverlappingHobbies(currentUserId, otherUserId);
    }

    @Transactional
    public void addOnboardingHobbies(Integer userId, UserOnboardingRequest request) {
        //verify that hobbies are unique
        Set<String> uniqueHobbies = request.hobbies().stream()
                                           .map(HobbyCreationRequest::name)
                                           .collect(Collectors.toSet());
        if (uniqueHobbies.size() < request.hobbies().size()) {
            throw new IllegalArgumentException("Onboarding hobby list contains duplicate hobbies");
        }

        List<Hobby> hobbies = request.hobbies().stream()
                                     .map(req ->
                                         hobbyMapper.toEntity(req, userId)
                                     ).toList();
        hobbyRepository.saveAll(hobbies);
    }

    //returns empty list if user not found
    @Transactional(readOnly = true)
    public List<HobbyPhotoResponse> getHobbyPhotosByUserId(Integer userId) {
        return hobbyPhotoRepository.findAllByUserId(userId).stream()
                                   .map(hobbyMapper::toPhotoResponse)
                                   .toList();
    }

    // --- private helper methods ---

    /**
     * Verify that hobby exists and that request is authorized. Log unauthorized
     * requests.
     * @throws ResourceNotFoundException if hobby does not exist or request is unauthorized
     */
    protected Hobby findHobbyByUserAndId(Integer userId, Integer hobbyId) {
        Hobby hobby = hobbyRepository.findById(hobbyId).orElseThrow(
                () -> new ResourceNotFoundException("Hobby not found with ID: " + hobbyId)
        );

        //verify ownership
        if (!hobby.getUserId().equals(userId)) {
            //log forbidden request
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
    protected HobbyPhoto findHobbyPhotoByUserAndId(Integer userId, Integer photoId) {
        HobbyPhoto photo = hobbyPhotoRepository.findById(photoId).orElseThrow(
                () -> new ResourceNotFoundException("Hobby photo not found with ID: " + photoId)
        );

        //verify ownership and log forbidden requests
        findHobbyByUserAndId(userId, photo.getHobbyId());

        return photo;
    }

}
