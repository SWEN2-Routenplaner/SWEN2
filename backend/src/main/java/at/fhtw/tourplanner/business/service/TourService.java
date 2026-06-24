package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.presentation.dto.request.TourCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourResponse;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TourService {
    public List<TourResponse> listTours(String owner, String name) {
        return null;
    }

    public TourResponse createTour(String owner, TourCreateRequest request) {
        return null;
    }

    public TourResponse getTour(String subject, Long tourId) {
        return null;
    }

    public TourResponse updateTour(String subject, Long tourId, @Valid TourCreateRequest request) {
        return null;
    }

    public void deleteTour(String subject, Long tourId) {
    }
}
