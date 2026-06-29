package at.fhtw.tourplanner.presentation.dto.response;

public record ImportSummary(
        Integer toursImported,
        Integer logsImported,
        Integer errors
) {
}
