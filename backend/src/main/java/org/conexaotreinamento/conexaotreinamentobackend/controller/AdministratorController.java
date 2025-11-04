package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO;
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
    public ResponseEntity<AdministratorListItemResponseDTO> createAdministratorAndUser(@RequestBody @Valid AdministratorCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(administratorService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdministratorListItemResponseDTO> findAdministratorById(@PathVariable UUID id) {
        return ResponseEntity.ok(administratorService.findById(id));
    }

    @GetMapping("/user-profile/{id}")
    public ResponseEntity<AdministratorListItemResponseDTO> findAdministratorByUserId(@PathVariable UUID id) {
        return ResponseEntity.ok(administratorService.findByUserId(id));
    }

    @GetMapping
    public ResponseEntity<List<AdministratorListItemResponseDTO>> findAllAdministrators() {
        return ResponseEntity.ok(administratorService.findAll());
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Endpoint funcionando sem autenticação!");
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<AdministratorListItemResponseDTO>> findAllPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive,
            @PageableDefault(size = 20, sort = "joinDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(administratorService.findAll(search, pageable, includeInactive));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdministratorResponseDTO> updateAdministratorAndUser(@PathVariable UUID id, @RequestBody @Valid AdministratorCreateRequestDTO request) {
        return ResponseEntity.ok(administratorService.put(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AdministratorResponseDTO> patchAdministrator(@PathVariable UUID id, @RequestBody @Valid PatchAdministratorRequestDTO request) {
        return ResponseEntity.ok(administratorService.patch(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteAdministratorUser(@PathVariable UUID id) {
        administratorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<AdministratorResponseDTO> restoreAdministrator(@PathVariable UUID id) {
        return ResponseEntity.ok(administratorService.restore(id));
    }
}