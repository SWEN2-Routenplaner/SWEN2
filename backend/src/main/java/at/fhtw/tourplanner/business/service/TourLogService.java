package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import at.fhtw.tourplanner.dataaccess.entity.TourLogEntity;
import at.fhtw.tourplanner.dataaccess.repository.TourLogRepository;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.exception.ResourceNotFoundException;
import at.fhtw.tourplanner.presentation.dto.request.TourLogCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourLogResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourLogService {

    private final TourLogRepository tourLogRepository;
    private final TourRepository tourRepository;

    public List<TourLogResponse> listLogs(String owner, Long tourId) {
        log.debug("Listing logs for tour id={} (owner '{}')", tourId, owner);
        verifyTourExists(tourId);
        return tourLogRepository.findAllByTourId(tourId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TourLogResponse createLog(String owner, Long tourId, @Valid TourLogCreateRequest request) {
        log.info("Creating log for tour id={} (owner '{}')", tourId, owner);
        TourEntity tourEntity = findTour(tourId);
        TourLogEntity entity = new TourLogEntity();
        entity.setTour(tourEntity);
        applyRequest(entity, request);
        TourLogEntity saved = tourLogRepository.save(entity);
        log.info("Created log id={} for tour id={}", saved.getId(), tourId);
        return toResponse(saved);
    }

    public TourLogResponse getLog(String owner, Long tourId, Long logId) {
        log.debug("Fetching log id={} for tour id={} (owner '{}')", logId, tourId, owner);
        verifyTourExists(tourId);
        return toResponse(findLog(tourId, logId));
    }

    public TourLogResponse updateLog(String owner, Long tourId, Long logId, @Valid TourLogCreateRequest request) {
        log.info("Updating log id={} for tour id={} (owner '{}')", logId, tourId, owner);
        verifyTourExists(tourId);
        TourLogEntity existing = findLog(tourId, logId);
        applyRequest(existing, request);
        return toResponse(tourLogRepository.save(existing));
    }

    public void deleteLog(String owner, Long tourId, Long logId) {
        log.info("Deleting log id={} for tour id={} (owner '{}')", logId, tourId, owner);
        verifyTourExists(tourId);
        TourLogEntity entity = findLog(tourId, logId);
        tourLogRepository.deleteById(entity.getId());
    }

    // TODO: ADD image update

    /*
     * HELPER
     * */

    // it could be possible that a tour no longer exists
    // (although it shouldn't, since the db should cascade a deleted)
    private void verifyTourExists(Long tourId) {
        if (!tourRepository.existsById(tourId)) {
            log.warn("Tour not found with id={}", tourId);
            throw new ResourceNotFoundException("Tour not found with id: " + tourId);
        }
    }

    // TODO: consider removing the tourId since logId is unique
    private TourLogEntity findLog(Long tourId, Long logId) {
        return tourLogRepository.findByIdAndTourId(logId, tourId)
                .orElseThrow(() -> {
                    log.warn("TourLog not found with id={} for tour id={}", logId, tourId);
                    return new ResourceNotFoundException("TourLog not found with id: " + logId);
                });
    }

    private TourEntity findTour(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> {
                    log.warn("Tour not found with id={}", tourId);
                    return new ResourceNotFoundException("Tour not found with id: " + tourId);
                });
    }

    private void applyRequest(TourLogEntity entity, TourLogCreateRequest request) {
        entity.setDateTime(request.dateTime());
        entity.setComment(request.comment());
        entity.setDifficulty(request.difficulty());
        entity.setTotalDistance(request.totalDistance());
        entity.setTotalTime(request.totalTime());
        entity.setRating(request.rating());
    }

    private TourLogResponse toResponse(TourLogEntity entity) {
        return new TourLogResponse(
                entity.getId(),
                entity.getDateTime(),
                entity.getComment(),
                entity.getDifficulty(),
                entity.getTotalDistance(),
                entity.getTotalTime(),
                entity.getRating()
        );
    }
}
