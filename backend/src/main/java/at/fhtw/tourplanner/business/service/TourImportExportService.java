package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import at.fhtw.tourplanner.dataaccess.entity.TourLogEntity;
import at.fhtw.tourplanner.dataaccess.repository.TourLogRepository;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.presentation.dto.response.ExportResult;
import at.fhtw.tourplanner.presentation.dto.response.ImportSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourImportExportService {

    private final TourRepository tourRepository;
    private final TourLogRepository tourLogRepository;

    public String export(TourEntity tour) {
            try{
            JsonMapper mapper = new JsonMapper();
            // Convert the TourEntity to JSON
            String tourJson = mapper.writeValueAsString(tour);
            return tourJson;
        } catch (Exception e) {
            log.error("Error exporting tour: {}", e.getMessage());
            throw new IllegalStateException("Export failed", e);
        }
    }

    // TODO: Implement; Should call the functions for saving in tourRepository and tourLogRepository
    public ImportSummary importFile(String owner, MultipartFile file) {
        if(file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }
        JsonMapper mapper = new JsonMapper();

        TourEntity tourEntity = new TourEntity();
        try{
            tourEntity = mapper.readValue(file.getInputStream(), TourEntity.class);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read file", e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tour file format", e);
        }

        if(tourEntity.getName() == null || tourEntity.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tour name is missing");
        }

        tourEntity.setId(null);
        tourEntity.setOwner(owner);
        tourEntity.setImagePath(null);

        if(tourEntity.getLogs() != null) {
            for(TourLogEntity log : tourEntity.getLogs()) {
                log.setId(null);
                log.setTour(tourEntity);
            }
        }

        TourEntity savedTour = tourRepository.save(tourEntity);

        int logsImported = 0;
        if(tourEntity.getLogs() != null && !tourEntity.getLogs().isEmpty()) {
            for(TourLogEntity log : tourEntity.getLogs()) {
                log.setTour(savedTour);
                tourLogRepository.save(log);
                logsImported++;
            }
        }
        log.info("Imported tour '{}' with {} logs for owner '{}'", savedTour.getName(), logsImported, owner);
        return new ImportSummary(1, logsImported, 0);
    }
}
