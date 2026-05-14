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
import java.util.UUID;

public class UserSpecifications {

    public static Specification<User> buildHardFilterSpecification(MatchSearchRequest request, UUID userId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            List<MatchSearchRequest.MatchSearchFilter> filters = request.filters();

            //omit current user from results
            predicates.add(criteriaBuilder.notEqual(root.get("id"), userId));

            //omit users who have not completed onboarding
            predicates.add(criteriaBuilder.equal(root.get("onboardingComplete"), true));

            //join Users and Hobby tables
            Root<Hobby> hobbyRoot = query.from(Hobby.class);
            predicates.add(criteriaBuilder.equal(hobbyRoot.get("userId"), root.get("id")));
            //TODO: if codebase gets refactored to use JPA's ORM, change above line's equal() arguments

            //apply repository-level global filters (excludes radius and overlap, which are service-level)
            predicates.add(criteriaBuilder.equal(hobbyRoot.get("name"), request.hobby()));

            //calculate age from birthDate
            Expression<Integer> age = criteriaBuilder.function(
                    "date_part", Integer.class, criteriaBuilder.literal("year"), //extract year from
                    criteriaBuilder.function("age", Object.class, root.get("birthDate")) //time since birthDate
            );

            //apply requested filters (all are repository-level)
            for (MatchSearchRequest.MatchSearchFilter filter : filters) {
                if (filter.isHard()) {
                    Predicate predicate = switch (filter) {
                        case MatchSearchRequest.GendersFilter genders ->
                            root.get("genderMatched").in(genders.genders());
                        case MatchSearchRequest.MinAgeFilter minAge ->
                            criteriaBuilder.greaterThanOrEqualTo(age, minAge.minAge());
                        case MatchSearchRequest.MaxAgeFilter maxAge ->
                            criteriaBuilder.lessThanOrEqualTo(age, maxAge.maxAge());
                        case MatchSearchRequest.ExperienceLevelFilter experienceLevel ->
                            criteriaBuilder.equal(hobbyRoot.get("experienceLevel"), experienceLevel.experienceLevel());
                    };

                    predicates.add(predicate);
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

}
