package at.fhtw.tourplanner.business.mapper;

import at.fhtw.tourplanner.business.model.TourLog;
import at.fhtw.tourplanner.presentation.dto.request.TourLogCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourLogResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


/*
 * The Mapper ensures that the Services work on the domain models
 * and only call mappers at the edges. Services never touch DTOs directly for logic.
 * */
@Component
@RequiredArgsConstructor
public class TourLogMapper {
    public TourLogResponse toResponse(TourLog tourLog) {
        return new TourLogResponse(
                tourLog.getId(),
                tourLog.getDateTime(),
                tourLog.getComment(),
                tourLog.getDifficulty(),
                tourLog.getTotalDistance(),
                tourLog.getTotalTime(),
                tourLog.getRating()
        );
    }

    public TourLog toDomain(@Valid TourLogCreateRequest request) {
        TourLog log = new TourLog();
        log.setDateTime(request.dateTime());
        log.setComment(request.comment());
        log.setDifficulty(request.difficulty());
        log.setTotalDistance(request.totalDistance());
        log.setTotalTime(request.totalTime());
        log.setRating(request.rating());
        return log;
    }

    public void updateDomain(TourLog existing, @Valid TourLogCreateRequest request) {
        existing.setDateTime(request.dateTime());
        existing.setComment(request.comment());
        existing.setDifficulty(request.difficulty());
        existing.setTotalDistance(request.totalDistance());
        existing.setTotalTime(request.totalTime());
        existing.setRating(request.rating());
    }
}
