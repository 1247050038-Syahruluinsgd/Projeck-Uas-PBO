package com.timkita.app.repository;

import com.timkita.app.model.StudentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRecordRepository extends JpaRepository<StudentRecord, String> {

    long countByStatus(String status);

    @Query("SELECT COUNT(s), " +
           "COALESCE(SUM(CASE WHEN s.status = 'COMPLETE' THEN 1 ELSE 0 END), 0), " +
           "COALESCE(SUM(CASE WHEN s.status = 'INCOMPLETE' THEN 1 ELSE 0 END), 0) " +
           "FROM StudentRecord s")
    Object[] countDashboardStats();

    List<StudentRecord> findAllByOrderByCreatedAtDesc();

    @Query("SELECT s FROM StudentRecord s WHERE " +
           "(:status = 'ALL' OR s.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.userId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY s.createdAt DESC")
    List<StudentRecord> findByStatusAndSearch(
        @Param("status") String status,
        @Param("search") String search
    );
}
