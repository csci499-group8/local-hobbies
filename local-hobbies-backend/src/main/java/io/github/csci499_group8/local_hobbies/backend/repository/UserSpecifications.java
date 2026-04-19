package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.dto.match.MatchSearchRequest;
import io.github.csci499_group8.local_hobbies.backend.model.Hobby;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecifications {

    public static Specification<User> buildHardFilterSpecification(MatchSearchRequest request, Integer userId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            MatchSearchRequest.SearchFilters filters = request.filters();

            //omit current user from results
            predicates.add(criteriaBuilder.notEqual(root.get("id"), userId));

            //join Users and Hobby tables
            Root<Hobby> hobbyRoot = query.from(Hobby.class);
            predicates.add(criteriaBuilder.equal(hobbyRoot.get("userId"), root.get("id")));
            //TODO: if codebase gets refactored to use JPA's ORM, change above line's equal() arguments

            //apply repository-level global filters (excludes radius and overlap, which are service-level)
            predicates.add(criteriaBuilder.equal(hobbyRoot.get("hobbyName"), request.hobby()));

            //calculate age from birthDate
            Expression<Integer> age = criteriaBuilder.function(
                    "date_part", Integer.class, criteriaBuilder.literal("year"), //extract year from
                    criteriaBuilder.function("age", Object.class, root.get("birthDate")) //time since birthDate
            );

            //apply requested filters (all are repository-level)
            for (String filterName : request.hardFilters()) {
                switch (filterName) {
                    case "genders" ->
                            predicates.add(root.get("genderMatched").in(filters.genders()));
                    case "minAge" ->
                            predicates.add(criteriaBuilder.greaterThanOrEqualTo(age, filters.minAge()));
                    case "maxAge" ->
                            predicates.add(criteriaBuilder.lessThanOrEqualTo(age, filters.maxAge()));
                    case "experienceLevel" ->
                            predicates.add(criteriaBuilder.equal(hobbyRoot.get("experienceLevel"), filters.experienceLevel()));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

}
