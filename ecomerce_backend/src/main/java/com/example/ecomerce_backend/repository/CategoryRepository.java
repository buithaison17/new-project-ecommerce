package com.example.ecomerce_backend.repository;

import com.example.ecomerce_backend.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    @Query("SELECT c FROM Category c WHERE c.isDeleted = false ORDER BY c.name ASC")
    List<Category> findAllActive();

    @Query("SELECT c FROM Category c WHERE c.id = :id AND c.isDeleted = false")
    Optional<Category> findActiveById(@Param("id") Long id);

    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND c.isDeleted = false")
    boolean existsActiveByName(@Param("name") String name);

    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND c.isDeleted = false AND c.id <> :id")
    boolean existsActiveByNameAndIdNot(@Param("name") String name, @Param("id") Long id);
}
