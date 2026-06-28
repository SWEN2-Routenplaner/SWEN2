package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.presentation.dto.response.ExportResult;
import at.fhtw.tourplanner.presentation.dto.response.ImportSummary;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class TourImportExportService {
    public ExportResult export(List<TourEntity> tours, String format) {
        return null;
    }

    public ImportSummary importFile(String owner, MultipartFile file, TourRepository tourRepository) {
        return null;
    }
}
