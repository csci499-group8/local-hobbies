package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.model.Hobby;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HobbyRepository extends JpaRepository<Hobby, Integer> {

    void saveAll(List<Hobby> hobbies);

    Hobby save(Hobby hobby);

    void delete(Hobby hobby);

    Optional<Hobby> findById(Integer hobbyId);

    List<Hobby> findAllByUserId(Integer userId);

    Integer countByUserId(Integer userId);

    List<HobbyOverlapResponse> findOverlappingHobbies(Integer currentUserId, Integer otherUserId);

    boolean existsByUserAndName(Integer userId, @NotBlank String name);

}
