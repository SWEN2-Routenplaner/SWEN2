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

    /*
    * Need the casts to String/lower and Query for the search to function on more than just the description.
    */
    @Query("""
    SELECT l FROM TourLogEntity l
    WHERE l.tour.owner = :owner
      AND (LOWER(l.comment) LIKE LOWER(CONCAT('%', :query, '%'))
        OR CAST(l.dateTime AS String) LIKE CONCAT('%', :query, '%')
        OR CAST(l.difficulty AS String) LIKE CONCAT('%', :query, '%')
        OR CAST(l.rating AS String) LIKE CONCAT('%', :query, '%')
        OR CAST(l.totalDistance AS String) LIKE CONCAT('%', :query, '%')
        OR CAST(l.totalTime AS String) LIKE CONCAT('%', :query, '%'))
    """)
    List<TourLogEntity> searchByOwner(@Param("owner") String owner,
                                      @Param("query") String query);
}
