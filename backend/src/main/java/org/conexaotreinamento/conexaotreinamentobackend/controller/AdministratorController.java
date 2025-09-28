package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
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
    public ResponseEntity<AdministratorResponseDTO> createAdministrator(@RequestBody @Valid AdministratorRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(administratorService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdministratorResponseDTO> findAdministratorById(@PathVariable UUID id) {
        return ResponseEntity.ok(administratorService.findById(id));
    }

    @GetMapping
    public ResponseEntity<Page<AdministratorResponseDTO>> findAllAdministrators(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(administratorService.findAll(search, pageable, includeInactive));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdministratorResponseDTO> updateAdministrator(@PathVariable UUID id, @RequestBody @Valid AdministratorRequestDTO request) {
        return ResponseEntity.ok(administratorService.update(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AdministratorResponseDTO> patchAdministrator(@PathVariable UUID id, @RequestBody @Valid PatchAdministratorRequestDTO request) {
        return ResponseEntity.ok(administratorService.patch(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdministrator(@PathVariable UUID id) {
        administratorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<AdministratorResponseDTO> restoreAdministrator(@PathVariable UUID id) {
        return ResponseEntity.ok(administratorService.restore(id));
    }
}