package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.presentation.dto.request.TourLogCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourLogResponse;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TourLogService {

    public List<TourLogResponse> listLogs(String subject, Long tourId) {
        return null;
    }

    public TourLogResponse createLog(String subject, Long tourId, @Valid TourLogCreateRequest request) {
        return null;
    }

    public TourLogResponse getLog(String subject, Long tourId, Long logId) {
        return null;
    }

    public TourLogResponse updateLog(String subject, Long tourId, Long logId, @Valid TourLogCreateRequest request) {
        return null;
    }

    public void deleteLog(String subject, Long tourId, Long logId) {

    }
}
