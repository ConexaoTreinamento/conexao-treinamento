package org.conexaotreinamento.conexaotreinamentobackend.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * Standard paginated response wrapper for list endpoints.
 * Provides consistent pagination metadata across all API endpoints.
 */
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Paginated response wrapper")
public record PageResponse<T>(
        
        @Schema(description = "Current page content")
        List<T> content,
        
        @Schema(description = "Current page number (zero-based)", example = "0")
        int page,
        
        @Schema(description = "Page size", example = "20")
        int size,
        
        @Schema(description = "Total number of elements across all pages", example = "100")
        long totalElements,
        
        @Schema(description = "Total number of pages", example = "5")
        int totalPages,
        
        @Schema(description = "Whether this is the first page")
        boolean first,
        
        @Schema(description = "Whether this is the last page")
        boolean last,
        
        @Schema(description = "Whether the page is empty")
        boolean empty,
        
        @Schema(description = "Number of elements in current page", example = "20")
        int numberOfElements
) {
    
    /**
     * Creates a PageResponse from a Spring Data Page object.
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .numberOfElements(page.getNumberOfElements())
                .build();
    }
    
    /**
     * Creates a PageResponse from a Spring Data Page object with mapped content.
     */
    public static <T, U> PageResponse<U> of(Page<T> page, Function<T, U> mapper) {
        return PageResponse.<U>builder()
                .content(page.getContent().stream().map(mapper).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .numberOfElements(page.getNumberOfElements())
                .build();
    }
}

