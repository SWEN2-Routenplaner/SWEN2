package at.fhtw.tourplanner.dataaccess.repository;

import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<TourEntity, Long> {

    List<TourEntity> findAllByOwner(String owner);

    /*
     * Need the casts to String/lower and Query for the search to function on more than just the description.
     */
    @Query("""
        SELECT t FROM TourEntity t
        WHERE t.owner = :owner
          AND (LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(t.fromLocation) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(t.toLocation) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(CAST(t.transportType AS String)) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(t.routeInformation) LIKE LOWER(CONCAT('%', :query, '%')))
    """)
    List<TourEntity> searchByOwner(@Param("owner") String owner,
                                   @Param("query") String query);
}