package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdministratorService {
    private final AdministratorRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AdministratorResponseDTO create(AdministratorRequestDTO request) {
        if (repository.existsByEmailIgnoringCaseAndDeletedAtIsNull(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já está em uso");
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        Administrator administrator = new Administrator(
                request.firstName(),
                request.lastName(),
                request.email(),
                encodedPassword
        );
        
        Administrator saved = repository.save(administrator);
        return AdministratorResponseDTO.fromEntity(saved);
    }

    public AdministratorResponseDTO findById(UUID id) {
        Administrator administrator = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrador não encontrado"));
        return AdministratorResponseDTO.fromEntity(administrator);
    }

    public Page<AdministratorResponseDTO> findAll(String search, Pageable pageable, boolean includeInactive) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), 
                                    Sort.by("createdAt").descending());
        }
        
        Page<Administrator> administrators;
        if (search == null || search.isBlank()) {
            administrators = includeInactive ? 
                repository.findAll(pageable) : 
                repository.findByDeletedAtIsNull(pageable);
        } else {
            String searchTerm = "%" + search.toLowerCase() + "%";
            administrators = includeInactive ? 
                repository.findBySearchTermIncludingInactive(searchTerm, pageable) :
                repository.findBySearchTermAndDeletedAtIsNull(searchTerm, pageable);
        }
        
        return administrators.map(AdministratorResponseDTO::fromEntity);
    }

    @Transactional
    public AdministratorResponseDTO update(UUID id, AdministratorRequestDTO request) {
        Administrator administrator = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrador não encontrado"));

        // Check email uniqueness only if different from current
        if (!administrator.getEmail().equalsIgnoreCase(request.email()) &&
            repository.existsByEmailIgnoringCaseAndDeletedAtIsNull(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já está em uso");
        }

        administrator.setFirstName(request.firstName());
        administrator.setLastName(request.lastName());
        administrator.setEmail(request.email());
        administrator.setPassword(passwordEncoder.encode(request.password()));

        Administrator saved = repository.save(administrator);
        return AdministratorResponseDTO.fromEntity(saved);
    }

    @Transactional
    public AdministratorResponseDTO patch(UUID id, PatchAdministratorRequestDTO request) {
        Administrator administrator = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrador não encontrado"));

        if (request.firstName() != null) {
            administrator.setFirstName(request.firstName());
        }
        
        if (request.lastName() != null) {
            administrator.setLastName(request.lastName());
        }
        
        if (request.email() != null) {
            // Check email uniqueness only if different from current
            if (!administrator.getEmail().equalsIgnoreCase(request.email()) &&
                repository.existsByEmailIgnoringCaseAndDeletedAtIsNull(request.email())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já está em uso");
            }
            administrator.setEmail(request.email());
        }
        
        if (request.password() != null) {
            administrator.setPassword(passwordEncoder.encode(request.password()));
        }

        Administrator saved = repository.save(administrator);
        return AdministratorResponseDTO.fromEntity(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Administrator administrator = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrador não encontrado"));
        
        administrator.deactivate();
        repository.save(administrator);
    }

    @Transactional
    public AdministratorResponseDTO restore(UUID id) {
        Administrator administrator = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrador não encontrado"));
        
        if (administrator.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Administrador já está ativo");
        }
        
        administrator.activate();
        Administrator saved = repository.save(administrator);
        return AdministratorResponseDTO.fromEntity(saved);
    }
}