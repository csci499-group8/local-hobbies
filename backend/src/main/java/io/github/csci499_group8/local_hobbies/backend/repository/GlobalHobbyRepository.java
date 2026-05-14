package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.GlobalHobby;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlobalHobbyRepository extends JpaRepository<GlobalHobby, String> {

//    public List<GlobalHobby> findAll();

}
