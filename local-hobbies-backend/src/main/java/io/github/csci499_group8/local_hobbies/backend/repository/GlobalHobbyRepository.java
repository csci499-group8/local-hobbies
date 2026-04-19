package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.GlobalHobby;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface GlobalHobbyRepository extends JpaRepository<GlobalHobby, Integer> {

    public Collection<GlobalHobby> getAll();

}
