package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import at.fhtw.tourplanner.dataaccess.entity.TourLogEntity;
import at.fhtw.tourplanner.dataaccess.repository.TourLogRepository;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.exception.ResourceNotFoundException;
import at.fhtw.tourplanner.presentation.dto.request.TourCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.ExportResult;
import at.fhtw.tourplanner.presentation.dto.response.ImportSummary;
import at.fhtw.tourplanner.presentation.dto.response.TourResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.AccessDeniedException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final RouteService routeService;
    private final TourLogRepository tourLogRepository;
    private final ImageStorageService imageStorageService;

    public List<TourResponse> listTours(String owner, String query) {
        log.debug("Listing tours for owner '{}' (query='{}')", owner, query);
        List<TourEntity> entities = (query == null || query.isBlank())
                ? tourRepository.findAllByOwner(owner)
                : tourRepository.searchByOwner(owner, query);
        log.debug("Found {} tours for owner '{}'", entities.size(), owner);
        return entities.stream()
                .map(this::toResponse)
                .toList();
    }

    public TourResponse createTour(String owner, TourCreateRequest request) {
        log.info("Creating tour '{}' for owner '{}'", request.name(), owner);
        TourEntity tour = new TourEntity();
        tour.setOwner(owner);
        applyRequest(tour, request);

        // create the route using our routeService
        if (tour.getDistance() == null || tour.getEstimatedTime() == null) {
            //  TODO: adjust if routeService is working!
            tour.setDistance(0.0);
            tour.setEstimatedTime(1L);
            tour.setRouteInformation("PLACEHOLDER: route not computed (ORS integration pending)");
            //routeService.createRoute(tour);
        }

        TourEntity saved = tourRepository.save(tour);
        log.info("Created tour id={} for owner '{}'", saved.getId(), owner);
        return toResponse(saved);
    }

    public TourResponse getTour(String owner, Long tourId) throws AccessDeniedException {
        /*
         * TODO: add some mechanism to calculate the tour if the
         *  last calculated tour in the database is older than a certain time
         * */
        log.debug("Fetching tour id={} for owner '{}'", tourId, owner);
        return toResponse(findAndVerifyOwner(owner, tourId));
    }

    public TourResponse updateTour(String subject, Long tourId, @Valid TourCreateRequest request) throws AccessDeniedException {
        log.info("Updating tour id={} for owner '{}'", tourId, subject);
        TourEntity existing = findAndVerifyOwner(subject, tourId);
        applyRequest(existing, request);

        // Re calculate the tour TODO: Adjust once createRoute is working
        //routeService.createRoute(existing);

        return toResponse(tourRepository.save(existing));
    }

    public void deleteTour(String owner, Long tourId) throws AccessDeniedException {
        log.info("Deleting tour id={} for owner '{}'", tourId, owner);
        TourEntity tour = findAndVerifyOwner(owner, tourId);
        tourRepository.deleteById(tour.getId());
    }

    public TourResponse uploadImage(String owner, Long tourId, MultipartFile file) throws AccessDeniedException {
        log.info("Uploading image for tour id={} (owner '{}')", tourId, owner);
        TourEntity tour = findAndVerifyOwner(owner, tourId);

        String previousImage = tour.getImagePath();
        String storedFileName = imageStorageService.store(tourId, file);
        tour.setImagePath(storedFileName);
        TourEntity saved = tourRepository.save(tour);

        // remove the replaced image so we don't leave orphans on the filesystem
        if (previousImage != null && !previousImage.equals(storedFileName)) {
            imageStorageService.delete(previousImage);
        }
        return toResponse(saved);
    }

    public ImageResource getImage(String owner, Long tourId) throws AccessDeniedException {
        TourEntity tour = findAndVerifyOwner(owner, tourId);
        String imagePath = tour.getImagePath();
        if (imagePath == null || imagePath.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour has no image");
        }
        Resource resource = imageStorageService.load(imagePath);
        String contentType = imageStorageService.probeContentType(imagePath);
        return new ImageResource(resource, contentType);
    }

    public record ImageResource(Resource resource, String contentType) {}

    // TODO: implement TourImportExportService
    TourImportExportService tourImportExportService;

    // TourService
    public String exportTours(String owner, Long tourId, String format) {
        log.info("Exporting tour for id '{}' as '{}'", tourId, format);
        TourEntity tour = tourRepository.findById(tourId).orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + tourId));
        return tourImportExportService.export(tour);
    }

    public ImportSummary importTours(String owner, MultipartFile file) {
        log.info("Importing tours for owner '{}' from file '{}'", owner, file.getOriginalFilename());
        return tourImportExportService.importFile(owner, file); // TODO: Implement; Should call the functions for saving in tourRepository and tourLogRepository
    }


    /*
     * HELPER
     * */
    private TourEntity findAndVerifyOwner(String owner, Long tourId) throws AccessDeniedException {
        TourEntity tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + tourId));
        if (!tour.getOwner().equals(owner)) {
            throw new AccessDeniedException("Not your tour!");
        }
        return tour;
    }

    private void applyRequest(TourEntity entity, TourCreateRequest request) {
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setFromLocation(request.from());
        entity.setToLocation(request.to());
        entity.setTransportType(request.transportType());
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
}
