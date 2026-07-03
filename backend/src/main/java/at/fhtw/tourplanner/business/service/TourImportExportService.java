package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import at.fhtw.tourplanner.dataaccess.entity.TourLogEntity;
import at.fhtw.tourplanner.dataaccess.repository.TourLogRepository;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.presentation.dto.response.ExportResult;
import at.fhtw.tourplanner.presentation.dto.response.ImportSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourImportExportService {

    TourRepository tourRepository;
    TourLogRepository tourLogRepository;

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
        return null;
    }
}
