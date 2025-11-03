package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateAdministratorDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListAdministratorsDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.AdministratorService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/administrators")
@RequiredArgsConstructor
public class AdministratorController {
    private final AdministratorService administratorService;

    @PostMapping
    public ResponseEntity<ListAdministratorsDTO> createAdministratorAndUser(@RequestBody @Valid CreateAdministratorDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(administratorService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ListAdministratorsDTO>> findAllAdministrators() {
        return ResponseEntity.ok(administratorService.findAll());
    }

    @GetMapping("/{administratorId}")
    public ResponseEntity<ListAdministratorsDTO> findAdministratorById(@PathVariable UUID administratorId) {
        return ResponseEntity.ok(administratorService.findById(administratorId));
    }

    @GetMapping("/user-profile/{userId}")
    public ResponseEntity<ListAdministratorsDTO> findAdministratorByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(administratorService.findByUserId(userId));
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Endpoint funcionando sem autenticação!");
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<ListAdministratorsDTO>> findAllPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive,
            @PageableDefault(size = 20, sort = "joinDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(administratorService.findAll(search, pageable, includeInactive));
    }

    @PutMapping("/{administratorId}")
    public ResponseEntity<AdministratorResponseDTO> updateAdministrator(@PathVariable UUID administratorId, @RequestBody @Valid CreateAdministratorDTO request) {
        return ResponseEntity.ok(administratorService.put(administratorId, request));
    }

    @PatchMapping("/{administratorId}")
    public ResponseEntity<AdministratorResponseDTO> patchAdministrator(@PathVariable UUID administratorId, @RequestBody @Valid PatchAdministratorRequestDTO request) {
        return ResponseEntity.ok(administratorService.patch(administratorId, request));
    }

    @DeleteMapping("/{administratorId}")
    public ResponseEntity<Void> deleteAdministrator(@PathVariable UUID administratorId) {
        administratorService.delete(administratorId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{administratorId}/restore")
    public ResponseEntity<AdministratorResponseDTO> restoreAdministrator(@PathVariable UUID administratorId) {
        return ResponseEntity.ok(administratorService.restore(administratorId));
    }
}