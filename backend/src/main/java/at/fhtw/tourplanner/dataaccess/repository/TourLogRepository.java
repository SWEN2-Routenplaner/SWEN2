package at.fhtw.tourplanner.dataaccess.repository;

import at.fhtw.tourplanner.dataaccess.entity.TourLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourLogRepository extends JpaRepository<TourLogEntity, Long> {

    List<TourLogEntity> findAllByTourId(Long tourId);

    Optional<TourLogEntity> findByIdAndTourId(Long id, Long tourId);

    @Query("""
    SELECT l FROM TourLogEntity l
    WHERE l.tour.owner = :owner
      AND LOWER(l.comment) LIKE LOWER(CONCAT('%', :query, '%'))
    """)
    List<TourLogEntity> searchByOwner(@Param("owner") String owner,
                                      @Param("query") String query);
}
