package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.business.mapper.TourMapper;
import at.fhtw.tourplanner.business.model.Tour;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.exception.ResourceNotFoundException;
import at.fhtw.tourplanner.presentation.dto.request.TourCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.ExportResult;
import at.fhtw.tourplanner.presentation.dto.response.ImportSummary;
import at.fhtw.tourplanner.presentation.dto.response.TourResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.AccessDeniedException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final TourMapper tourMapper;
    private final RouteService routeService;

    public List<TourResponse> listTours(String owner, String query) {
        List<Tour> tours = (query == null | query.isBlank())
                ? tourRepository.findAllByOwner(owner)
                : tourRepository.searchByOwner(owner,query);
        return tours.stream().map(tourMapper::toResponse).toList();
    }

    public TourResponse createTour(String owner, TourCreateRequest request) {
        Tour tour = tourMapper.toDomain(request);
        tour.setOwner(owner);

        // create the route using our routeService
        routeService.createRoute(tour);

        Tour saved = tourRepository.save(tour);
        return tourMapper.toResponse(saved);
    }

    public TourResponse getTour(String owner, Long tourId) throws AccessDeniedException {
        /*
         * TODO: add some mechanism to calculate the tour if the
         *  last calculated tour in the database is older than a certain time
         * */
        Tour tour = findAndVerifyOwner(owner,tourId);
        return tourMapper.toResponse(tour);
    }

    public TourResponse updateTour(String subject, Long tourId, @Valid TourCreateRequest request) throws AccessDeniedException {
        Tour existing = findAndVerifyOwner(subject,tourId);
        tourMapper.updateDomain(existing,request);

        // Re calculate the tour
        routeService.createRoute(existing);

        Tour saved = tourRepository.save(existing);
        return tourMapper.toResponse(saved);
    }

    public void deleteTour(String owner, Long tourId) throws AccessDeniedException {
        Tour tour = findAndVerifyOwner(owner,tourId);
        tourRepository.deleteById(tour.getId());
    }

    public ExportResult exportTours(String owner, String format) {
        List<Tour> tours = tourRepository.findAllByOwner(owner);
        return tourRepository.export(tours, format);
    }

    public ImportSummary importTours(String owner, MultipartFile file) {
        return tourRepository.importFile(owner, file);
    }

    /*
    * HELPER
    * */
    private Tour findAndVerifyOwner(String owner, Long tourId) throws AccessDeniedException {
        Tour tour = tourRepository.findById(tourId);
        if(tour == null){
            throw new ResourceNotFoundException("Tour not found with id: " + tourId);
        }
        if(!tour.getOwner().equals(owner)){
            throw new AccessDeniedException("Not your tour!");
        }
        return tour;
    }
}
