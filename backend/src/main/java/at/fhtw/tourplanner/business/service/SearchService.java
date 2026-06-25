package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.business.mapper.TourLogMapper;
import at.fhtw.tourplanner.business.mapper.TourMapper;
import at.fhtw.tourplanner.dataaccess.repository.TourLogRepository;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.presentation.dto.response.SearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final TourRepository tourRepository;
    private final TourLogRepository tourLogRepository;
    private final TourMapper tourMapper;
    private final TourLogMapper tourLogMapper;

    public SearchResponse search(String owner, String q) {
        var tours = tourRepository.searchByOwner(owner, q)
                .stream().map(tourMapper::toResponse).toList();
        var logs = tourLogRepository.searchByOwner(owner, q)
                .stream().map(tourLogMapper::toResponse).toList();
        return new SearchResponse(tours, logs);
    }
}
