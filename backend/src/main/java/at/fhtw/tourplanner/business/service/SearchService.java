package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import at.fhtw.tourplanner.dataaccess.entity.TourLogEntity;
import at.fhtw.tourplanner.dataaccess.repository.TourLogRepository;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.presentation.dto.response.SearchResponse;
import at.fhtw.tourplanner.presentation.dto.response.TourLogResponse;
import at.fhtw.tourplanner.presentation.dto.response.TourResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final TourRepository tourRepository;
    private final TourLogRepository tourLogRepository;

    public SearchResponse search(String owner, String q) {
        log.debug("Full-text search for owner '{}' (q='{}')", owner, q);
        var tours = tourRepository.searchByOwner(owner, q)
                .stream().map(this::toResponse).toList();
        var logs = tourLogRepository.searchByOwner(owner, q)
                .stream().map(this::toResponse).toList();
        log.debug("Search for '{}' matched {} tours and {} logs", q, tours.size(), logs.size());
        return new SearchResponse(tours, logs);
    }

    private TourResponse toResponse(TourEntity entity) {
        return new TourResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getFromLocation(),
                entity.getToLocation(),
                entity.getTransportType(),
                entity.getDistance(),
                entity.getEstimatedTime(),
                entity.getRouteInformation()
        );
    }

    private TourLogResponse toResponse(TourLogEntity entity) {
        return new TourLogResponse(
                entity.getId(),
                entity.getTour().getId(),
                entity.getDateTime(),
                entity.getComment(),
                entity.getDifficulty(),
                entity.getTotalDistance(),
                entity.getTotalTime(),
                entity.getRating()
        );
    }
}
