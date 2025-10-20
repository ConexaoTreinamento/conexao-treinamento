package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateAdministratorDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateUserRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListAdministratorsDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdministratorService {

    private final AdministratorRepository administratorRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public ListAdministratorsDTO create(CreateAdministratorDTO request) {
        if (administratorRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Administrator with this email already exists");
        }

        UserResponseDTO savedUser = userService.createUser(new CreateUserRequestDTO(request.email(), request.password(), Role.ROLE_ADMIN));

        Administrator administrator = request.toEntity(savedUser.id());
        Administrator savedAdministrator = administratorRepository.save(administrator);

        return administratorRepository.findActiveAdministratorProfileById(savedAdministrator.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Created administrator not found"));
    }

    public ListAdministratorsDTO findById(UUID id) {
        return administratorRepository.findActiveAdministratorProfileById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrator not found"));
    }

    public ListAdministratorsDTO findByUserId(UUID id) {
        return administratorRepository.findActiveAdministratorByUserId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrator not found"));
    }

    public List<ListAdministratorsDTO> findAll() {
        return administratorRepository.findAllAdministratorProfiles(true);
    }

    public Page<ListAdministratorsDTO> findAll(String search, Pageable pageable, boolean includeInactive) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), 
                                    Sort.by("joinDate").descending());
        }
        
        if (search == null || search.isBlank()) {
            return includeInactive ? 
                administratorRepository.findAllAdministratorsPage(pageable) : 
                administratorRepository.findActiveAdministratorsPage(pageable);
        } else {
            String searchTerm = "%" + search.toLowerCase() + "%";
            List<ListAdministratorsDTO> searchResults = includeInactive ? 
                administratorRepository.findBySearchTermIncludingInactive(searchTerm) :
                administratorRepository.findBySearchTermAndActive(searchTerm);
            
            // Convert List to Page for compatibility with existing controller
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), searchResults.size());
            
            if (start > searchResults.size()) {
                return Page.empty(pageable);
            }
            
            List<ListAdministratorsDTO> pageContent = searchResults.subList(start, end);
            return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, searchResults.size());
        }
    }

    @Transactional
    public AdministratorResponseDTO put(UUID id, CreateAdministratorDTO request) {
        Administrator administrator = administratorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrator not found"));

        // Always update the associated user's email (mandatory)
        UserResponseDTO updatedUser = userService.updateUserEmail(administrator.getUserId(), request.email());
        
        // Conditionally update password (optional)
        if (request.hasPassword()) {
            userService.resetUserPassword(administrator.getUserId(), request.password());
        }

        // Update administrator fields
        administrator.setFirstName(request.firstName());
        administrator.setLastName(request.lastName());

        Administrator savedAdministrator = administratorRepository.save(administrator);

        // Buscar o User para obter o createdAt e outros dados
        User user = userRepository.findByIdAndDeletedAtIsNull(administrator.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return AdministratorResponseDTO.fromEntity(savedAdministrator, updatedUser.email(), user.isActive(), user.getCreatedAt(), user.getUpdatedAt());
    }

    @Transactional
    public AdministratorResponseDTO patch(UUID id, PatchAdministratorRequestDTO request) {
        Administrator administrator = administratorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrator not found"));

        User user = userRepository.findByIdAndDeletedAtIsNull(administrator.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserResponseDTO updatedUser = null;

        // Update email if provided
        if (request.email() != null) {
            updatedUser = userService.updateUserEmail(administrator.getUserId(), request.email());
        }

        // Update administrator fields
        if (request.firstName() != null) {
            administrator.setFirstName(request.firstName());
        }
        
        if (request.lastName() != null) {
            administrator.setLastName(request.lastName());
        }

        Administrator savedAdministrator = administratorRepository.save(administrator);

        // Refresh user data if it was updated
        if (updatedUser != null) {
            user = userRepository.findByIdAndDeletedAtIsNull(administrator.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        }

        return AdministratorResponseDTO.fromEntity(savedAdministrator, user.getEmail(), user.isActive(), user.getCreatedAt(), user.getUpdatedAt());
    }

    @Transactional
    public void delete(UUID administratorId) {
        Optional<Administrator> administrator = administratorRepository.findById(administratorId);
        administrator.ifPresent(value -> userService.delete(value.getUserId()));
    }

    @Transactional
    public AdministratorResponseDTO restore(UUID administratorId) {
        Administrator administrator = administratorRepository.findById(administratorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrator not found"));
        
        // Reativar o usuário associado
        UserResponseDTO restoredUser = userService.restore(administrator.getUserId());
        
        // Buscar o User atualizado
        User user = userRepository.findById(administrator.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return AdministratorResponseDTO.fromEntity(
            administrator, 
            user.getEmail(), 
            user.isActive(), 
            user.getCreatedAt(), 
            user.getUpdatedAt()
        );
    }
}